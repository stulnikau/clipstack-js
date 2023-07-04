import React, { useState } from "react";

import { FaSearch } from "react-icons/fa";

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";

import UserMenu from "./UserMenu";
import Logo from "./Logo";

const Navigation = ({ logoutAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const args = {
    color: "dark",
    dark: true,
    expand: "xs",
    fixed: "top",
  };

  const mainLinks = [
    {
      title: "Home",
      href: "/",
    },
  ];

  return (
    <div>
      <Navbar {...args}>
        <NavbarBrand href="/">
          <Logo width={125} />
        </NavbarBrand>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            {mainLinks.map(({ title, href }) => {
              return <NavLink href={href}>{title}</NavLink>;
            })}
          </Nav>
          <Nav className="ms-auto" navbar>
            <NavItem>
              <NavLink href="/search">
                <FaSearch />
              </NavLink>
            </NavItem>
            <NavItem>
              <UserMenu logoutAction={logoutAction} />
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
};

export default Navigation;
