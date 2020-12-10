import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import {
  addTag,
  getTags,
  listenTags,
} from "../../../services/firebase/operations/tags";
import { AuthContext } from "../../../App";
import toArray from "lodash/toArray";

export default ({ show, handleClose, action, tag }) => {
  const { plan } = useContext(AuthContext);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        return await getTags(plan ? plan : " ");
      } catch (error) {
        return error;
      }
    }

    fetchData()
      .then((data) => {
        if (data.exists()) {
          setTags(toArray(data.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenTagsChange();
  }, []);

  const listenTagsChange = () => {
    listenTags(plan ? plan : " ", (tags) => {
      if (tags.exists()) {
        setTags(toArray(tags.val()));
      }
    });
  };

  useEffect(() => {
    setName(tag.Name ? tag.Name : "");
    setComments(tag.Comments ? tag.Comments : "");
  }, [tag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tags.find((tag) => tag.Name.toUpperCase() === Name.toUpperCase())) {
      newErrorToast(`El código ${Name} ya existe`);
      return;
    }

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
          {action === "ADD"
            ? "Agregar Tipo de Actividad"
            : "Editar Tipo de Actividad"}
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
