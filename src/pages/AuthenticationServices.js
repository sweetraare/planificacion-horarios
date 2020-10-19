import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import {
  changePassword,
  verifyConfirmEmailCode,
  verifyResetCode,
} from "../services/firebase/auth";
import { LOGIN_PAGE } from "../constants/routes";
import LoginLayout from "../HOC/LoginLayout";
import queryString from "query-string";
import { newErrorToast, newSuccessToast } from "../utils/toasts";

export default ({ history }) => {
  const parsedQuery = queryString.parse(history.location.search);

  const { mode, oobCode } = parsedQuery;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      let response = null;

      try {
        switch (mode) {
          case "verifyEmail":
            response = verifyConfirmEmailCode(oobCode);
            break;
          case "resetPassword":
            response = verifyResetCode(oobCode);
            break;
          default:
            response = null;
        }
        if (response) {
          return response;
        }
      } catch (error) {
        newErrorToast(`There's an error on our server, please try again`);
      }
    };

    fetchData()
      .then((data) => {
        mode === "resetPassword" && setEmail(data);
      })
      .catch((error) =>
        newErrorToast(`There's an error on our server, please try again`)
      );
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (confirmPassword === password) {
      try {
        await changePassword(parsedQuery.oobCode, password);
        newSuccessToast(
          `You're password has been changed successfully. You can now Log In`
        );
        history.push(LOGIN_PAGE);
      } catch (error) {
        newErrorToast(
          `There's an error changing your password, please try again later`
        );
      }
    } else {
      setError("Password is not equals");
    }
  };

  return (
    <LoginLayout>
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={6}>
          <Card body>
            {mode === "resetPassword" ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    disabled={true}
                  />
                </Form.Group>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPasswordConfirm">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password confirmation"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Change
                </Button>
                {error ? (
                  <Form.Text className="text-danger">{error}</Form.Text>
                ) : null}
              </Form>
            ) : (
              <h2>
                Your E-mail has been verified successfully. You can now go back
                to the App.
              </h2>
            )}
          </Card>
        </Col>
      </Row>
    </LoginLayout>
  );
};
