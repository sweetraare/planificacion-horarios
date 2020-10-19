import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { SignInAdmin } from "../services/firebase/auth";
import isEqual from "lodash/isEqual";
import { HOME_PAGE, RESET_PASSWORD } from "../constants/routes";
import { AuthContext } from "../App";
import { getUserById } from "../services/firebase/operations/users";
import { Link } from "react-router-dom";
import LoginLayout from "../HOC/LoginLayout";

export default ({ history }) => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !error) {
      history.push(HOME_PAGE);
    }
  }, [history, user, error]);

  const handleSubmit = (event) => {
    SignInAdmin(email, password)
      .then(async (resp) => {
        if (resp) {
          const userFetched = await getUserById(resp.user.uid);
          if (userFetched.exists()) {
            history.push(HOME_PAGE);
          } else {
            setError("Error en el ingreso!");
          }
        }
      })
      .catch((error) => {
        const messageError = isEqual(error.code, "auth/wrong-password")
          ? "Wrong Password"
          : "Invalid e-mail";
        setError(messageError);
      });
    event.preventDefault();
  };

  return (
    <LoginLayout>
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={6}>
          <Card body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="E-mail"
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Form.Text className="text-muted">
                  Don't share your password
                </Form.Text>
              </Form.Group>
              <Button variant="primary" type="submit">
                Log In
              </Button>
              &nbsp;
              <Button
                variant="secondary"
                type="button"
                onClick={() => history.push("/home")}
              >
                Cancel
              </Button>
              {error ? (
                <Form.Text className="text-danger">{error}</Form.Text>
              ) : null}
              <br />
              <Form.Text>
                <Link to={RESET_PASSWORD}>I forget my password</Link>
              </Form.Text>
            </Form>
          </Card>
        </Col>
      </Row>
    </LoginLayout>
  );
};
