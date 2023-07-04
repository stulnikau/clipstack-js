var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { encryptToken, decryptToken } = require("../utils/encryption.js");

const {
  rejectUnauthenticated,
  getAuthenticationStatus,
} = require("../middleware/auth.js");

const SALT_ROUNDS = 10;

const BEARER_DEFAULT_EXPIRES_IN = 60 * 10; // 10 minutes
const REFRESH_DEFAULT_EXPIRES_IN = 60 * 60 * 24; // 24 hours

// Validate date format
function isValidDate(dateString) {
  // Regular expression to match the date pattern
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the date string matches the pattern
  if (!datePattern.test(dateString)) {
    return false;
  }

  // Parse the date parts from the date string
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(5, 7), 10);
  const day = parseInt(dateString.substring(8, 10), 10);

  // Create a new Date object using the parsed parts
  const date = new Date(year, month - 1, day);

  // Check if the parsed date parts are valid
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  return true;
}

// Check if YYYY-MM-DD date is in the past
const isPastDate = (date) => {
  const today = new Date();
  const dateParts = date.split("-");
  const dateObject = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2])
  );
  return dateObject < today;
};

/* POST login. */
router.post("/login", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const bearerExpiresInSeconds = req.body.bearerExpiresInSeconds
    ? parseInt(req.body.bearerExpiresInSeconds)
    : BEARER_DEFAULT_EXPIRES_IN;
  const refreshExpiresInSeconds = req.body.refreshExpiresInSeconds
    ? parseInt(req.body.refreshExpiresInSeconds)
    : REFRESH_DEFAULT_EXPIRES_IN;

  // Verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
    return;
  }

  const queryUsers = req.db
    .select("*")
    .from("movies.users")
    .where("email", "=", email);
  queryUsers
    .then((users) => {
      if (users.length === 0) {
        throw new Error("Incorrect email or password");
      }

      // Compare password hashes
      const user = users[0];
      return bcrypt.compare(password, user.hash);
    })
    .then((match) => {
      if (!match) {
        throw new Error("Incorrect email or password");
      }
      // Create JWT token
      const now = Math.floor(Date.now() / 1000);
      const bearerToken = jwt.sign(
        { email, exp: now + bearerExpiresInSeconds, iat: now },
        process.env.JWT_SECRET
      );
      const refreshToken = jwt.sign(
        { email, exp: now + refreshExpiresInSeconds, iat: now },
        process.env.JWT_SECRET
      );
      return { bearerToken, refreshToken };
    })
    .then(({ bearerToken, refreshToken }) => {
      // Send tokens back to user
      res.status(200).json({
        bearerToken: {
          token: bearerToken,
          token_type: "Bearer",
          expires_in: bearerExpiresInSeconds,
        },
        refreshToken: {
          token: refreshToken,
          token_type: "Refresh",
          expires_in: refreshExpiresInSeconds,
        },
      });
      return refreshToken;
    })
    .then((refreshToken) => {
      // Encrypt refresh token
      return encryptToken(refreshToken);
    })
    .then((refreshToken) => {
      // Update refresh token in DB alongside user
      return req.db
        .from("movies.users")
        .update({ refresh_token: refreshToken })
        .where("email", "=", email);
    })
    .catch((e) => {
      res.status(401).json({ error: true, message: e.message });
    });
});

/* POST register. */
router.post("/register", (req, res, next) => {
  // Retrieve email and password from req.body
  const email = req.body.email;
  const password = req.body.password;

  // Verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
    return;
  }

  // Determine if user already exists in table
  const queryUsers = req.db
    .select("*")
    .from("movies.users")
    .where("email", "=", email);
  queryUsers
    .then((users) => {
      if (users.length > 0) {
        throw new Error("User already exists");
      }

      // Insert user into DB
      const hash = bcrypt.hashSync(password, SALT_ROUNDS);
      return req.db.from("users").insert({ email, hash });
    })
    .then(() => {
      res.status(201).json({ message: "User created" });
    })
    .catch((e) => {
      res.status(409).json({ message: e.message });
    });
});

/* POST refresh. */
router.post("/refresh", (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  // Verify body
  if (!refreshToken) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, refresh token required",
    });
    return;
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: true, message: "JWT token has expired" });
      return;
    } else {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
      return;
    }
  }

  // Check if refresh token is in DB
  const queryUsers = req.db
    .select("*")
    .from("movies.users")
    .where("email", "=", decoded.email);
  queryUsers
    .then((users) => {
      if (users.length === 0) {
        throw new Error("Invalid refresh token");
      }
      const user = users[0];
      return user.refresh_token;
    })
    .then((userRefreshToken) => {
      // Decrypt refresh token
      return decryptToken(userRefreshToken);
    })
    .then((userRefreshToken) => {
      // Compare refresh token with token in DB
      if (refreshToken !== userRefreshToken) {
        throw new Error("Invalid refresh token");
      }
    })
    .then(() => {
      // Create new tokens
      const now = Math.floor(Date.now() / 1000);
      const bearerToken = jwt.sign(
        {
          email: decoded.email,
          exp: now + BEARER_DEFAULT_EXPIRES_IN,
          iat: now,
        },
        process.env.JWT_SECRET
      );
      const newRefreshToken = jwt.sign(
        {
          email: decoded.email,
          exp: now + REFRESH_DEFAULT_EXPIRES_IN,
          iat: now,
        },
        process.env.JWT_SECRET
      );
      return { bearerToken, newRefreshToken };
    })
    .then(({ bearerToken, newRefreshToken }) => {
      res.status(200).json({
        bearerToken: {
          token: bearerToken,
          token_type: "Bearer",
          expires_in: BEARER_DEFAULT_EXPIRES_IN,
        },
        refreshToken: {
          token: newRefreshToken,
          token_type: "Refresh",
          expires_in: REFRESH_DEFAULT_EXPIRES_IN,
        },
      });
      return newRefreshToken;
    })
    .then((newRefreshToken) => {
      // Encrypt refresh token
      return encryptToken(newRefreshToken);
    })
    .then((newRefreshToken) => {
      // Update refresh token in DB alongside user
      return req.db
        .from("movies.users")
        .update({ refresh_token: newRefreshToken })
        .where("email", "=", decoded.email);
    })
    .catch((_) => {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
    });
});

/* POST logout. */
router.post("/logout", (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  // Verify body
  if (!refreshToken) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, refresh token required",
    });
    return;
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: true, message: "JWT token has expired" });
      return;
    } else {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
      return;
    }
  }

  // Check if refresh token is in DB
  const queryUsers = req.db
    .select("*")
    .from("movies.users")
    .where("email", "=", decoded.email);
  queryUsers
    .then((users) => {
      if (users.length === 0) {
        throw new Error("Invalid refresh token");
      }
      const user = users[0];
      return user.refresh_token;
    })
    .then((userRefreshToken) => {
      // Decrypt refresh token
      return decryptToken(userRefreshToken);
    })
    .then((userRefreshToken) => {
      // Compare refresh token with token in DB
      if (refreshToken !== userRefreshToken) {
        throw new Error("Invalid refresh token");
      }
    })
    .then(() => {
      // Invalidate refresh token
      return req.db
        .from("movies.users")
        .update({ refresh_token: null })
        .where("email", "=", decoded.email);
    })
    .then(() => {
      res
        .status(200)
        .json({ error: false, message: "Token successfully invalidated" });
    })
    .catch((_) => {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
    });
});

/* GET user profile. */
router.get("/:email/profile", getAuthenticationStatus, (req, res, next) => {
  const email = req.params.email;
  var authorised = false;

  // Get authorisation status by comparing the email in the JWT with the requested email
  if (email === req.auth.email) {
    authorised = true;
  }

  // Retrieve user profile
  // If authorised, return email, firstName, lastName, dob, and address
  // If not authorised, return email, firstName, and lastName
  const queryUsers = req.db
    .select("email", "first_name", "last_name", "dob", "address")
    .from("movies.users")
    .where("email", "=", email);
  queryUsers
    .then((users) => {
      if (users.length === 0) {
        throw new Error("User not found");
      }

      if (authorised) {
        res.status(200).json({
          email: users[0].email,
          firstName: users[0].first_name,
          lastName: users[0].last_name,
          dob: users[0].dob,
          address: users[0].address,
        });
      } else {
        res.status(200).json({
          email: users[0].email,
          firstName: users[0].first_name,
          lastName: users[0].last_name,
        });
      }
    })
    .catch((e) => {
      res.status(404).json({ error: true, message: e.message });
    });
});

/* PUT user profile. */
router.put("/:email/profile", rejectUnauthenticated, (req, res, next) => {
  const email = req.params.email;

  // Check if user is authorised to update profile
  if (email !== req.auth.email) {
    res.status(403).json({
      error: true,
      message: "Forbidden",
    });
    return;
  }

  // Check if user exists
  const queryUsers = req.db
    .select("*")
    .from("movies.users")
    .where("email", "=", email);
  queryUsers.then((users) => {
    if (users.length === 0) {
      throw new Error("User not found");
    }
  });

  // Verify the request object contains the required fields
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const dob = req.body.dob;
  const address = req.body.address;

  if (!firstName || !lastName || !dob || !address) {
    res.status(400).json({
      error: true,
      message:
        "Request body incomplete: firstName, lastName, dob and address are required.",
    });
    return;
  }

  // Check if all fields are strings
  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof dob !== "string" ||
    typeof address !== "string"
  ) {
    res.status(400).json({
      error: true,
      message:
        "Request body invalid: firstName, lastName and address must be strings only.",
    });
    return;
  }

  // Check if dob is in the correct format
  if (!isValidDate(dob)) {
    res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
    });
    return;
  }

  // Check if dob is in the past
  if (!isPastDate(dob)) {
    res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a date in the past.",
    });
    return;
  }

  // Update user profile
  req.db
    .update({
      first_name: firstName,
      last_name: lastName,
      dob: dob,
      address: address,
    })
    .from("movies.users")
    .where("email", "=", email)
    .then(() => {
      // Retrieve updated user profile
      return req.db
        .select("email", "first_name", "last_name", "dob", "address")
        .from("movies.users")
        .where("email", "=", email);
    })
    .then((users) => {
      res.status(200).json({
        email: users[0].email,
        firstName: users[0].first_name,
        lastName: users[0].last_name,
        dob: users[0].dob,
        address: users[0].address,
      });
    })
    .catch((e) => {
      res.status(404).json({ error: true, message: e.message });
    });
});

module.exports = router;
