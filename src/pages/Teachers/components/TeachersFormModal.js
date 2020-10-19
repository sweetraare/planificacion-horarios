import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { addTeacher } from "../../../services/firebase/operations/teachers";

export default ({ show, handleClose, teachers, action, teacher }) => {
  const { plan } = useContext(AuthContext);

  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [TargetNumberOfHours, setTargetNumberOfHours] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (teachers.find((teacher) => teacher.Name === Name)) {
      newErrorToast(`Ya existe el profesor: ${Name}`);
    } else {
      try {
        const slug = action === "ADD" ? generateUniqueKey() : teacher.slug;
        await addTeacher(plan, slug, {
          Name,
          Comments,
          TargetNumberOfHours,
          slug,
        });
        newSuccessToast(`Profesor agregado con éxito`);
        setComments("");
        setName("");
        setTargetNumberOfHours(0);

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
        setTargetNumberOfHours(0);
        break;
      }
      case "EDIT": {
        setName(teacher.Name);
        setComments(teacher.Comments);
        setTargetNumberOfHours(teacher.TargetNumberOfHours);

        break;
      }
    }
  }, [action, teacher]);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {action === "ADD" ? "Agregar Profesor(es)" : "Editar Profesor"}
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
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Horas Objetivo:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="hours"
                type="number"
                value={TargetNumberOfHours}
                onChange={(event) => setTargetNumberOfHours(event.target.value)}
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
