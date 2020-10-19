import React from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { Container, Row } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Institution from "./Institution/Institution";
import DaysList from "./DaysList/DaysList";
import HoursList from "./HoursList/HoursList";

export default () => {
  return (
    <AdminLayout>
      <h1>Configuración Básica</h1>
      <Container fluid className="mb-5">
        <Row>
          <Col xs={12} md={6}>
            <Institution />
          </Col>
          <Col xs={12} md={6}>
            <DaysList />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col xs={12}>
            <HoursList />
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};
