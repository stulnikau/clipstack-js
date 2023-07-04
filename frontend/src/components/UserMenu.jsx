import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { FaUser } from "react-icons/fa";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const parseEmailFromToken = (token) => {
  if (token) {
    const decodedToken = JSON.parse(window.atob(token.split(".")[1]));
    return decodedToken.email;
  } else {
    return null;
  }
};

const UserMenu = ({ logoutAction }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    // Get the token from local storage
    const token = localStorage.getItem("token");
    if (token) {
      // Decode the token to get the email
      const email = parseEmailFromToken(token);
      setEmail(email);
    } else {
      setEmail(null);
    }

    // Listen to changes in token value
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Decode the token to get the email
        const email = parseEmailFromToken(token);
        setEmail(email);
      } else {
        setEmail(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Return a clean-up function called on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const menuArgs = {
    dark: true,
    end: true,
    flip: true,
  };

  let content = null;

  if (!email) {
    content = (
      <>
        <DropdownItem
          tag="span"
          onClick={() => {
            navigate("/login");
          }}
        >
          Login
        </DropdownItem>
        <DropdownItem
          tag="span"
          onClick={() => {
            navigate("/register");
          }}
        >
          Register
        </DropdownItem>
      </>
    );
  } else {
    content = (
      <>
        <DropdownItem disabled tag="span">
          User: {email}
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem tag="span" onClick={logoutAction}>
          Logout
        </DropdownItem>
      </>
    );
  }

  return (
    <UncontrolledDropdown nav>
      <DropdownToggle nav caret>
        <FaUser />
      </DropdownToggle>
      <DropdownMenu {...menuArgs}>{content}</DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default UserMenu;
