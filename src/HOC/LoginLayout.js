import React from "react";
import { Col, Container, Image, Row } from "react-bootstrap";

import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import Logo from "../assets/images/Logo-01.png";
import login from "../assets/images/login.png";

import "./LoginLayout.scss";

export default ({ children }) => {
  return (
    <>
      <Container fluid className="w-100 vh-100 login-container">
        <Row>
          <Col md={4} sm={0} className="d-none d-sm-block">
            {/* <Image src={login} fluid className="login-image"/> */}
          </Col>
          <Col md={8} sm={12}>
            <Image src={Logo} fluid className="login-logo" />
            <div>{children}</div>
          </Col>
        </Row>
      </Container>
    </>
  );
};
