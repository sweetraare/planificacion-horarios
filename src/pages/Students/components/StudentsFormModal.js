import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import ExcelReader from "../../../components/ExcelReader/ExcelReader";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { addStudent } from "../../../services/firebase/operations/students";
import { AuthContext } from "../../../App";

export default ({ show, handleClose, action, student }) => {
  const { plan } = useContext(AuthContext);
  const [Name, setName] = useState("");
  const [NumberOfStudents, setNumberOfStudents] = useState("");
  const [Comments, setComments] = useState("");

  useEffect(() => {
    setName(student.Name ? student.Name : "");
    setNumberOfStudents(
      student.NumberOfStudents ? student.NumberOfStudents : ""
    );
    setComments(student.Comments ? student.Comments : "");
  }, [student]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = action === "ADD" ? generateUniqueKey() : student.slug;
      await addStudent(plan ? plan : " ", slug, {
        Name,
        NumberOfStudents,
        Comments,
        slug,
      });
      newSuccessToast("Estudiantes agregados con éxito");
      setName("");
      setComments("");
      setNumberOfStudents("");
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
      console.log(error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {action === "ADD" ? "Agregar Estudiantes" : "Editar Estudiante"}
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
              Número de estudiantes:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="name"
                type="number"
                value={NumberOfStudents}
                onChange={(event) => setNumberOfStudents(event.target.value)}
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
                type="text"
                value={Comments}
                as="textarea"
                rows={3}
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
