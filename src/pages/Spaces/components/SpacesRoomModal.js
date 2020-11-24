import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { addSpace } from "../../../services/firebase/operations/spaces";
import { AuthContext } from "../../../App";

export default ({ show, handleClose, buildings }) => {
  console.log("buildings", buildings);
  const { plan } = useContext(AuthContext);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [Capacity, setCapacity] = useState("");
  const [Building, setBuilding] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = generateUniqueKey();
      await addSpace(plan ? plan : " ", "rooms", slug, {
        Name,
        Comments,
        slug,
        Capacity,
        Building,
      });
      newSuccessToast("Aula agregada con éxito");
      setName("");
      setComments("");
      setCapacity("");
      setBuilding("");
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
      console.log(error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Agregar Aulas</Modal.Title>
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
              Capacidad:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="capacidad"
                type="number"
                value={Capacity}
                required
                onChange={(event) => setCapacity(event.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Edificio:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="edificio"
                value={Building}
                as="select"
                onChange={(event) => setBuilding(event.target.value)}
                required
              >
                <option value="">----</option>
                {buildings &&
                  buildings.map((building, index) => (
                    <option value={building.slug} key={index}>
                      {building.Name}
                    </option>
                  ))}
              </Form.Control>
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
