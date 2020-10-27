import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { addSubject } from "../../../services/firebase/operations/subjects";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";

export default ({ show, handleClose, subjects, action, subject }) => {
  const { plan } = useContext(AuthContext);

  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (subjects.find((subject) => subject.Name === Name)) {
      newErrorToast(`Ya existe la materia: ${Name}`);
    } else {
      try {
        const slug = action === "ADD" ? generateUniqueKey() : subject.slug;
        await addSubject(plan, slug, { Name, Comments, slug });
        newSuccessToast(`Materia agregada con éxito`);
        setComments("");
        setName("");

        action === "EDIT" && handleClose();
      } catch (error) {
        newErrorToast(error);
      }
    }
  };

  useEffect(() => {
    switch (action) {
      case "ADD": {
        setName("");
        setComments("");
        break;
      }
      case "EDIT": {
        setName(subject.Name);
        setComments(subject.Comments);
        break;
      }
    }
  }, [action, subject]);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {action === "ADD" ? "Agregar Materia(s)" : "Editar Materia"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Nombre:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="name"
                type="text"
                value={Name}
                required
                onChange={(event) => setName(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Comentarios:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="name"
                type="textarea"
                as="textarea"
                rows={3}
                value={Comments}
                onChange={(event) => setComments(event.target.value)}
              />
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
