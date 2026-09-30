import React, { useState } from "react";
import logoImg from "../../assets/logo.png";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
const NAV_ITEMS = [
  { name: "Về chúng tôi", href: "#about" },
  { name: "Khách hàng", href: "#customers" },
  { name: "Thợ", href: "#workers" },
];

function LogoImg({ height = 40 }) {
  return (
    <img
      src={logoImg}
      alt="Thợ Nhà"
      style={{ height, width: "auto", display: "block" }}
    />
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Navbar
      bg="white"
      expand="lg"
      className="border-bottom sticky-top py-3 w-100"
    >
      {/* <Container fluid className="px-4"> */}
      <Navbar.Brand as={Link} to="/">
        <img
          src={logoImg}
          alt="Thợ Nhà"
          style={{ height: "40px", width: "auto", objectFit: "contain" }}
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="register-navbar" />
      <Navbar.Collapse id="register-navbar">
        <Nav className="ms-auto align-items-center gap-3">
          {NAV_ITEMS.map((item) => (
            <Nav.Link
              key={item.name}
              href={item.href}
              className="fw-semibold text-dark"
            >
              {item.name}
            </Nav.Link>
          ))}
          <Button
            variant="outline-primary"
            className="fw-bold px-4 rounded-pill border-2"
            style={{ borderColor: "#F5820D", color: "#F5820D" }}
          >
            Đăng Nhập
          </Button>
        </Nav>
      </Navbar.Collapse>
      {/* </Container> */}
    </Navbar>
  );
}
