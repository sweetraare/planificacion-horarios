import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import {
  addSpace,
  listenSpaces,
  getSpaces,
} from "../../../services/firebase/operations/spaces";
import { AuthContext } from "../../../App";
import toArray from "lodash/toArray";

export default ({ show, handleClose }) => {
  const { plan } = useContext(AuthContext);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        return await getSpaces(plan ? plan : " ", "building");
      } catch (e) {
        return e;
      }
    }

    fetchData()
      .then((data) => {
        if (data.exists()) {
          setBuildings(toArray(data.val()));
        }
      })
      .catch((e) => {
        console.log(e);
        newErrorToast(`ERROR: ${e.message}`);
      });
    listenBuildingsChange();
  }, []);

  const listenBuildingsChange = () => {
    listenSpaces(plan ? plan : " ", "building", (data) => {
      if (data.exists()) {
        setBuildings(toArray(data.val()));
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      buildings.find(
        (building) => building.Name.toUpperCase() === Name.toUpperCase()
      )
    ) {
      newErrorToast(`ERROR: ${Name} ya se encuentra registrado`);
      return;
    }
    try {
      const slug = generateUniqueKey();
      await addSpace(plan ? plan : " ", "building", slug, {
        Name,
        Comments,
        slug,
      });
      newSuccessToast("Edificio agregado con éxito");
      setName("");
      setComments("");
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
      console.log(error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Edificio</Modal.Title>
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
