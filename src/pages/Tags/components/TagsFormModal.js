import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { addTag } from "../../../services/firebase/operations/tags";
import { AuthContext } from "../../../App";

export default ({ show, handleClose, action, tag }) => {
  const { plan } = useContext(AuthContext);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");

  useEffect(() => {
    setName(tag.Name ? tag.Name : "");
    setComments(tag.Comments ? tag.Comments : "");
  }, [tag]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = action === "ADD" ? generateUniqueKey() : tag.slug;
      await addTag(plan ? plan : " ", slug, {
        Name,
        Comments,
        slug,
      });
      newSuccessToast("Código agregado con éxito");
      setName("");
      setComments("");
      action === "EDIT" && handleClose();
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
      console.log(error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {" "}
          {action === "ADD" ? "Agregar Códigos" : "Editar Código"}
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
