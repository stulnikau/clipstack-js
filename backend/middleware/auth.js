const jwt = require("jsonwebtoken");

// Middleware to verify JWT token and reject unauthorised requests
const rejectUnauthenticated = (req, res, next) => {
  req.auth = { email: null };
  if (!("authorization" in req.headers)) {
    res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found",
    });
    return;
  } else if (!req.headers.authorization.match(/^Bearer /)) {
    res
      .status(401)
      .json({ error: true, message: "Authorization header is malformed" });
    return;
  }
  const token = req.headers.authorization.replace(/^Bearer /, "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth.email = decoded.email;
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: true, message: "JWT token has expired" });
    } else {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
    }
    return;
  }
  next();
};

// Middleware to verify JWT token and reject unauthorised requests
// Does not distinguish malformed tokens from not found tokens
const rejectUnauthenticatedWithNoMalformed = (req, res, next) => {
  if (
    !("authorization" in req.headers) ||
    !req.headers.authorization.match(/^Bearer /)
  ) {
    res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found",
    });
    return;
  }
  const token = req.headers.authorization.replace(/^Bearer /, "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: true, message: "JWT token has expired" });
    } else {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
    }
    return;
  }
  next();
};

// Middleware to get the authentication status of a request
const getAuthenticationStatus = (req, res, next) => {
  req.auth = { email: null };
  if (!("authorization" in req.headers)) {
    next();
    return;
  } else if (!req.headers.authorization.match(/^Bearer /)) {
    res.status(401).json({
      error: true,
      message: "Authorization header is malformed",
    });
    return;
  }
  const token = req.headers.authorization.replace(/^Bearer /, "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth.email = decoded.email;
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: true, message: "JWT token has expired" });
    } else {
      res.status(401).json({ error: true, message: "Invalid JWT token" });
    }
    return;
  }
  next();
};

module.exports = {
  rejectUnauthenticated,
  rejectUnauthenticatedWithNoMalformed,
  getAuthenticationStatus,
};
