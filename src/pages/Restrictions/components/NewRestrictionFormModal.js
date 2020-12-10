import React, { useContext, useEffect, useState } from "react";
import { Table, Card, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";
import {
  addSpaceConstraint,
  getSpaceContraints,
  removeSpaceConstraint,
  listenSpaceContraints,
} from "../../../services/firebase/operations/spaceConstraint";
import toArray from "lodash/toArray";

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
  const [spacesConstraints, setSpacesConstraints] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const spacesConstraintsFetched = await getSpaceContraints(
          plan ? plan : ""
        );
        return {
          spacesConstraintsFetched,
        };
      } catch (e) {
        return e;
      }
    }

    fetchData()
      .then((data) => {
        const { spacesConstraintsFetched } = data;

        if (spacesConstraintsFetched.exists()) {
          setSpacesConstraints(toArray(spacesConstraintsFetched.val()));
        }
      })
      .catch((e) => {
        console.log(e);
        newErrorToast(`ERROR: ${e.message}`);
      });
    listenSpaceConstraintsChange();
  }, []);

  const listenSpaceConstraintsChange = () => {
    listenSpaceContraints(plan ? plan : " ", (data) => {
      if (data.exists()) {
        setSpacesConstraints(toArray(data.val()));
      }
    });
  };

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

  const handleDeleteSpaceConstraint = async (spaceConstraint) => {
    try {
      await removeSpaceConstraint(plan ? plan : " ", spaceConstraint.slug);
      newSuccessToast(`Restricción eliminada exitosamente`);
    } catch (e) {
      console.log(e);
      newErrorToast(`ERROR: ${e.message}`);
    }
  };

  const renderConstraint = (spaceConstraint) => {
    const tagFound = tagsList.find((tag) => tag.slug === spaceConstraint.tag);
    const subjectFound = subjectsList.find(
      (subject) => subject.slug === spaceConstraint.subject
    );
    const roomFound = roomsList.find(
      (room) => room.slug === spaceConstraint.room
    );
    switch (spaceConstraint.restrictionType) {
      case "subject-room":
        return (
          <tr>
            <td>Materia-Aula</td>
            <td>{subjectFound && subjectFound.Name}</td>
            <td>{roomFound && roomFound.Name}</td>
            <td>
              <Button
                size="sm"
                onClick={() => handleDeleteSpaceConstraint(spaceConstraint)}
              >
                Eliminar
              </Button>
            </td>
          </tr>
        );
      case "tag-room":
        return (
          <tr>
            <td>Tipo-Aula</td>
            <td>{tagFound && tagFound.Name}</td>
            <td>{roomFound && roomFound.Name}</td>
            <td>
              <Button
                size="sm"
                onClick={() => handleDeleteSpaceConstraint(spaceConstraint)}
              >
                Eliminar
              </Button>
            </td>
          </tr>
        );
      case "subject-group":
        return (
          <tr>
            <td>Materia-Grupo</td>
            <td>{subjectFound && subjectFound.Name}</td>
            <td>
              <ul>
                {roomsList.length &&
                  spaceConstraint.preferredRooms &&
                  spaceConstraint.preferredRooms.map((pr) => (
                    <li>{roomsList.find((room) => room.slug === pr).Name}</li>
                  ))}
              </ul>
            </td>
            <td>
              <Button
                size="sm"
                onClick={() => handleDeleteSpaceConstraint(spaceConstraint)}
              >
                Eliminar
              </Button>
            </td>
          </tr>
        );
      case "tag-group":
        return (
          <tr>
            <td>Tipo-Grupo</td>
            <td>{tagFound && tagFound.Name}</td>
            <td>
              {roomsList.length && spaceConstraint.preferredRooms && (
                <ul>
                  {spaceConstraint.preferredRooms.map((pr) => (
                    <li>{roomsList.find((room) => room.slug === pr).Name}</li>
                  ))}
                </ul>
              )}
            </td>
            <td>
              <Button
                size="sm"
                onClick={() => handleDeleteSpaceConstraint(spaceConstraint)}
              >
                Eliminar
              </Button>
            </td>
          </tr>
        );

      default:
        return null;
    }
  };
  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Agregar nueva Restricción de Espacio</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={6}>
            <Card.Body>
              <h3>Datos Seleccionados</h3>
              <p>{`Materia: ${
                selectedSubject.Name ? selectedSubject.Name : ""
              }`}</p>
              <p>{`Aula: ${selectedRoom.Name ? selectedRoom.Name : ""}`}</p>
              <p>{`Tipo Actividad: ${
                selectedTag.Name ? selectedTag.Name : ""
              }`}</p>
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
                        [...event.target.selectedOptions].map(
                          (opt) => opt.value
                        )
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
          </Col>
          <Col xs={6}>
            <Card.Body>
              <h3>Restricciones existentes</h3>
              <Table responsive striped bordered size={"sm"}>
                <thead>
                  <tr>
                    <th>Tipo Restricción</th>
                    <th>Materia/Tipo Actividad</th>
                    <th>Aula(s)</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {spacesConstraints.map((sc) => renderConstraint(sc))}
                </tbody>
              </Table>
            </Card.Body>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
};
