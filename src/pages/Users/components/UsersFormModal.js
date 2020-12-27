import React, { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import isEmpty from "lodash/isEmpty";
import { newErrorToast } from "../../../utils/toasts";
import { ROLES } from "../../../constants/constants";

export default ({ show, itemToEdit, handleClose, handleSaveItem }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setEmail(itemToEdit["email"] ? itemToEdit["email"] : "");
    setFirstName(itemToEdit["firstName"] ? itemToEdit["firstName"] : "");
    setLastName(itemToEdit["lastName"] ? itemToEdit["lastName"] : "");
    setRole(itemToEdit["role"] ? itemToEdit["role"] : "");
  }, [itemToEdit]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (role.length) {
      let item = {
        firstName,
        lastName,
        email,
        role,
        active: true,
      };
      if (isEmpty(itemToEdit)) {
        item.created = new Date();
      } else {
        item.updated = new Date();
      }
      handleSaveItem(item);
    } else {
      newErrorToast("Please choose a role");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {!isEmpty(itemToEdit) ? "Editar usuario" : "Agragar usuario"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/*Email Form Group*/}
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Correo electrónico
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="Email"
                type="text"
                value={email}
                required
                disabled={!isEmpty(itemToEdit)}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Col>
          </Form.Group>
          {/*First Name Form Group*/}
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Nombre
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="firstName"
                type="text"
                value={firstName}
                required
                onChange={(event) => setFirstName(event.target.value)}
              />
            </Col>
          </Form.Group>
          {/*Last Name Form Group*/}
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Apellido
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="lastName"
                type="text"
                value={lastName}
                required
                onChange={(event) => setLastName(event.target.value)}
              />
            </Col>
          </Form.Group>
          {/*Role Form Group*/}
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Rol:{" "}
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                as="select"
                name="role"
                value={role}
                required
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="">Selecciona un rol</option>
                {ROLES.map((role) => (
                  <option value={role.value}>{role.label}</option>
                ))}
              </Form.Control>
            </Col>
          </Form.Group>

          <Form.Group>
            <Button type="submit" variant="primary">
              Guardar
            </Button>
            <Button variant="secondary" className="ml-3" onClick={handleClose}>
              Cancelar
            </Button>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
