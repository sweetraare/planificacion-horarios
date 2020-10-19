import React from 'react';
import Card from "react-bootstrap/Card";
import {Col, Row} from "react-bootstrap";

const CardChart = ({children, title}) => {
  return (
    <Card>
      <Card.Header>
        <Row>
          <Col xs={12} className="text-center"><h5>{title}</h5></Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col xs={12}>
            {children}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

};

export default CardChart;
