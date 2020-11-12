import React, { useContext, useEffect, useState } from "react";
import { Card, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";
import { addSpaceConstraint } from "../../../services/firebase/operations/spaceConstraint";

export default ({
  show,
  handleClose,
  subject,
  room,
  tag,
  subjectsList,
  roomsList,
  tagsList,
}) => {
  const { plan } = useContext(AuthContext);

  const [selectedSubject, setSelectedSubject] = useState({});
  const [selectedRoom, setSelectedRoom] = useState({});
  const [selectedTag, setSelectedTag] = useState({});
  const [isSetOfRooms, setIsSetOfRooms] = useState(false);
  const [selectedRestrictionType, setSelectedRestrictionType] = useState("");
  const [selectedSetOfRooms, setSelectedSetOfRooms] = useState([]);
  useEffect(() => {
    const subjectFound = subjectsList.find((s) => s.slug === subject);
    setSelectedSubject(subjectFound ? subjectFound : {});
  }, [subject]);

  useEffect(() => {
    const roomFound = roomsList.find((s) => s.slug === room);
    setSelectedRoom(roomFound ? roomFound : {});
  }, [room]);

  useEffect(() => {
    const tagFound = tagsList.find((t) => t.slug === tag);
    setSelectedTag(tagFound ? tagFound : {});
  }, [tag]);

  const renderConstraintTypes = () => {
    const options = [];
    // space constraints
    if (selectedSubject.slug && selectedRoom.slug) {
      //TODO implement how to choose which rooms
      options.push(
        <option value="subject-room">
          Materia ({selectedSubject.Name}) tiene un Aula preferida (
          {selectedRoom.Name})
        </option>
      );
    }
    if (selectedSubject.slug) {
      options.push(
        <option value="subject-group">
          Materia ({selectedSubject.Name}) tiene un grupo de aulas preferidas
        </option>
      );
    }
    if (selectedTag.slug) {
      options.push(
        <option value="tag-group">
          Categoría ({selectedTag.Name}) tiene un grupo de aulas preferidas
        </option>
      );
    }
    if (selectedTag.slug && selectedRoom.slug) {
      //TODO implement how to choose which rooms
      options.push(
        <option value="tag-room">
          Categoría ({selectedTag.Name}) tiene un Aula preferida (
          {selectedRoom.Name})
        </option>
      );
    }
    return options;
  };

  useEffect(() => {
    if (
      selectedRestrictionType === "tag-group" ||
      selectedRestrictionType === "subject-group"
    ) {
      setIsSetOfRooms(true);
    }
  }, [selectedRestrictionType]);

  const handleSave = async () => {
    const newItem = {
      slug: generateUniqueKey(),
      restrictionType: selectedRestrictionType,
    };
    switch (selectedRestrictionType) {
      case "subject-room":
        newItem.subject = selectedSubject.slug;
        newItem.room = selectedRoom.slug;
        break;
      case "tag-room":
        newItem.tag = selectedTag.slug;
        newItem.room = selectedRoom.slug;
        break;
      case "subject-group":
        if (selectedSetOfRooms.length) {
          newItem.subject = selectedSubject.slug;

          newItem.preferredRooms = selectedSetOfRooms;
        } else {
          newErrorToast(`Debe seleccionar un grupo de aulas.`);
          return;
        }
        break;
      case "tag-group":
        if (selectedSetOfRooms.length) {
          newItem.tag = selectedTag.slug;
          newItem.preferredRooms = selectedSetOfRooms;
        } else {
          newErrorToast(`Debe seleccionar un grupo de aulas.`);
          return;
        }

        break;
      default:
        break;
    }
    try {
      await addSpaceConstraint(plan ? plan : " ", newItem.slug, newItem);
      newSuccessToast(`Restricción de espacio agregada exitosamente`);
      handleClose();
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Agregar nueva Restricción de Espacio</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card.Body>
          <h3>Datos Seleccionados</h3>
          {/* <p>{`Profesor: ${ */}
          {/* selectedTeacher.Name ? selectedTeacher.Name : "" */}
          {/* }`}</p> */}
          <p>{`Materia: ${
            selectedSubject.Name ? selectedSubject.Name : ""
          }`}</p>
          <p>{`Aula: ${selectedRoom.Name ? selectedRoom.Name : ""}`}</p>

          {/* <p>{`Estudiantes: ${ */}
          {/* selectedStudents.Name ? selectedStudents.Name : "" */}
          {/* }`}</p> */}
          <p>{`Código: ${selectedTag.Name ? selectedTag.Name : ""}`}</p>
          {/* <p> */}
          {/* Actividad: */}
          {/* {selectedActivity.id */}
          {/* ? `id: ${selectedActivity.id} grupo: ${selectedActivity.ActivityGroup} duración: ${selectedActivity.Duration} | ${selectedActivity.teacher.Name}, ${selectedActivity.subject.Name}, ${selectedActivity.students.Name} ` */}
          {/* : ""} */}
          {/* </p> */}
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
          {isSetOfRooms && (
            <Form.Group>
              <Form.Label>
                Seleccione las aulas para esta restricción
              </Form.Label>
              <Form.Control
                as="select"
                value={selectedSetOfRooms}
                onChange={(event) =>
                  setSelectedSetOfRooms(
                    [...event.target.selectedOptions].map((opt) => opt.value)
                  )
                }
                multiple
              >
                <option value="" disabled>
                  ---
                </option>
                {roomsList.map((room) => (
                  <option value={room.slug}>{room.Name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          )}
        </Card.Body>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
};
