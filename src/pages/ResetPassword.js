import React, {useState} from "react";
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import {ResetPassword} from "../services/firebase/auth";
import LoginLayout from "../HOC/LoginLayout";

export default ({history}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    ResetPassword(email)
      .then(a => alert(`An e-mail has been sent to you, please follow the instructions`))
      .catch(e => alert(e));

    event.preventDefault();
  };

  return (
    <LoginLayout>
      <Row className="justify-content-center mt-5">
        <Col sm={12} md={8}>
          <Card body>
            <Card.Subtitle>
              Please, enter your e-mail address below and we will send you information to recover your account
            </Card.Subtitle>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="E-mail"
                  onChange={event => setEmail(event.target.value)}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Send me an e-mail
              </Button>
              &nbsp;
              <Button variant="secondary" type="button" onClick={() => history.push("/login")}>
                Cancel
              </Button>
              <br/>
            </Form>
          </Card>
        </Col>
      </Row>
    </LoginLayout>
  );
};
