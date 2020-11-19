import React, { useContext, useEffect, useState } from "react";
import { Table, Card, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";
import { RESTRICTION_TYPES } from "../../../constants/restrictionTypes";
import {
  addTimeConstraintInput,
  listentimeContraintsInput,
  removeTimeConstriantInput,
  getTimeContraintsInput,
} from "../../../services/firebase/operations/timeConstraintsInput";
import toArray from "lodash/toArray";

export default ({
  show,
  handleClose,
  day,
  hour,
  teacher,
  activity,
  teachersList,
  activitiesList,
}) => {
  const { plan } = useContext(AuthContext);
  const [selectedRestrictionType, setSelectedRestrictionType] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState({});
  const [selectedActivity, setSelectedActivity] = useState({});
  const [timeConstraints, setTimeConstraints] = useState([]);
  const [timeConstraintsVisible, setTimeConstraintsVisible] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const timeConstraintsFetched = await getTimeContraintsInput(
          plan ? plan : " "
        );
        return { timeConstraintsFetched };
      } catch (e) {
        return e;
      }
    }
    fetchData()
      .then((data) => {
        const { timeConstraintsFetched } = data;
        if (timeConstraintsFetched.exists()) {
          const timeConstraintsArray = toArray(timeConstraintsFetched.val());
          setTimeConstraints(timeConstraintsArray);
          setTimeConstraintsVisible(
            timeConstraintsArray.filter(
              (tc) => tc.day === day && tc.hour === hour
            )
          );
        }
      })
      .catch((e) => {
        console.log(e);
        newErrorToast(`ERROR: ${e.message}`);
      });
  }, []);
  const handleSave = async () => {
    try {
      const newItem = {
        slug: generateUniqueKey(),
        restrictionType: selectedRestrictionType,
        day,
        hour,
      };
      switch (selectedRestrictionType) {
        case "teacher-not-available":
          newItem.teacher = selectedTeacher.slug;
          break;
        case "activity-preferred-hour":
          newItem.activity = selectedActivity.value;
          break;
        default:
          return;
      }
      addTimeConstraintInput(plan ? plan : " ", newItem);
      newSuccessToast(`Restricción agregada exitosamente`);
      handleClose();
    } catch (e) {
      console.log(e);
      newErrorToast(`ERROR: ${e.message}`);
    }
    listenTimeConstraintsChange();
  };

  const listenTimeConstraintsChange = () => {
    listentimeContraintsInput(plan ? plan : " ", (data) => {
      if (data.exists()) {
        setTimeConstraints(toArray(data.val()));
      }
    });
  };

  useEffect(() => {
    const teacherFound = teachersList.find((t) => t.slug === teacher);
    setSelectedTeacher(teacherFound ? teacherFound : {});
  }, [teacher]);

  useEffect(() => {
    const activityFound = activitiesList.find((a) => a.value === activity);
    setSelectedActivity(activityFound ? activityFound : {});
  }, [activity]);

  useEffect(() => {
    setTimeConstraintsVisible(
      timeConstraints.filter((tc) => tc.day === day && tc.hour === hour)
    );
  }, [day, hour, timeConstraints]);

  const renderConstraintTypes = () => {
    const options = [];
    if (selectedTeacher.slug) {
      options.push(
        <option value="teacher-not-available">
          Profesor horario no disponible
        </option>
      );
    }
    if (selectedActivity.value) {
      options.push(
        <option value="activity-preferred-hour">
          Actividad horario preferido de inicio
        </option>
      );
    }
    return options;
  };

  const renderConstraint = (timeConstraint) => {
    const teacherFound = teachersList.find(
      (teacher) => teacher.slug === timeConstraint.teacher
    );
    const activityFound = activitiesList.find(
      (activity) => activity.value === timeConstraint.activity
    );
    if (timeConstraint.restrictionType === "teacher-not-available") {
      return (
        <tr>
          <td>Profesor no disponible</td>
          <td>{teacherFound && teacherFound.Name}</td>
          <td>
            <Button size="sm">Eliminar</Button>
          </td>
        </tr>
      );
    }
    if (timeConstraint.restrictionType === "activity-preferred-hour") {
      return (
        <tr>
          <td>Actividad horario preferido de inicio</td>
          <td>{activityFound && activityFound.label}</td>
          <td>
            <Button size="sm">Eliminar</Button>
          </td>
        </tr>
      );
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          Restricciones de tiempo de {day}: {hour}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={6}>
            <Card.Body>
              <h3>Datos Seleccionados</h3>
              <p>
                {`Profesor: ${
                  selectedTeacher.Name ? selectedTeacher.Name : ""
                }`}
              </p>
              <p>
                {`Actividad: ${
                  selectedActivity.label ? selectedActivity.label : ""
                }`}
              </p>
            </Card.Body>
            <Form.Group>
              <Form.Label>
                En base a lo seleccionado, puedes crear una de las siguientes
                restricciones
              </Form.Label>
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
                {renderConstraintTypes()}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col xs={6}>
            <Card.Body>
              <h3>Restricciones existentes</h3>
              <Table responsive striped bordered size={"sm"}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Profesor/Actividad</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {timeConstraintsVisible.map((tc) => renderConstraint(tc))}
                </tbody>
              </Table>
            </Card.Body>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave}>Guardar</Button>
        <Button onClick={handleClose} variant={"secondary"}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
