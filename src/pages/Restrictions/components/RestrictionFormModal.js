import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";
import { RESTRICTION_TYPES } from "../../../constants/restrictionTypes";
import { addTimeConstraintInput } from "../../../services/firebase/operations/timeConstraintsInput";

export default ({
  show,
  handleClose,
  day,
  hour,
  restrictions,
  teacher,
  activity,
}) => {
  const { plan } = useContext(AuthContext);
  const [selectedRestrictionType, setSelectedRestrictionType] = useState("");
  const [currentRestrictions, setCurrentRestrictions] = useState([]);

  const handleSave = () => {};

  const handleAddItem = () => {
    setCurrentRestrictions(
      [...currentRestrictions].concat({
        type: selectedRestrictionType,
        value:
          selectedRestrictionType === "teacherNotAvailable"
            ? teacher
            : activity,
      })
    );
  };
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Horario seleccionado: {day}: {hour}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {currentRestrictions.length ? (
          <div>
            <h3>Restricciones actuales de este horario</h3>
            <hr />
            <Row>
              <Col>
                <h4>Actividad con horario preferido</h4>
                {currentRestrictions
                  .filter((cr) => cr.type === "preferedActivityHour")
                  .map((cr) => (
                    <p>{cr.value}</p>
                  ))}
              </Col>
              <Col>
                <h4>Profesor no disponible</h4>
                {currentRestrictions
                  .filter((cr) => cr.type === "teacherNotAvailable")
                  .map((cr) => (
                    <p>{cr.value}</p>
                  ))}
              </Col>
            </Row>
            <hr />
          </div>
        ) : null}
        <Form.Group as={Row}>
          <Form.Label column sm={4}>
            Tipo de Restricción:
          </Form.Label>
          <Col sm={4}>
            <Form.Control
              value={selectedRestrictionType}
              as="select"
              onChange={(event) =>
                setSelectedRestrictionType(event.target.value)
              }
            >
              <option value="" disabled>
                ---
              </option>
              {RESTRICTION_TYPES.map((rt) => (
                <option value={rt.value}>{rt.label}</option>
              ))}
            </Form.Control>
          </Col>
          <Col sm={4}>
            <Button variant="secondary" onClick={handleAddItem}>
              Agregar
            </Button>
          </Col>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
};
