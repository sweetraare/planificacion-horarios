import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ListGroup,
  ButtonGroup,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { editStudentProperty } from "../../../services/firebase/operations/students";
import { AuthContext } from "../../../App";
import "./StudentsGroupModal.css";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";

export default ({ show, handleClose, student }) => {
  const { plan } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [NumberOfStudents, setNumberOfStudents] = useState("");
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    setGroups(student.groups ? student.groups : []);
    setSelectedIndex(-1);
    setIsNewGroup(false);
  }, [student]);

  const handleChangeGroup = (index) => {
    const groupsCopy = [...groups];
    groupsCopy[index] = {
      ...groupsCopy[index],
      Name,
      Comments,
      NumberOfStudents,
    };
    setGroups(groupsCopy);
    setName("");
    setComments("");
    setNumberOfStudents("");
    setSelectedIndex(-1);
  };

  const handleAddNew = () => {
    setIsNewGroup(false);
    const groupsCopy = [...groups];
    groupsCopy.push({
      Name,
      Comments,
      NumberOfStudents,
      slug: generateUniqueKey(),
    });
    setGroups(groupsCopy);
    setName("");
    setComments("");
    setNumberOfStudents("");
  };

  const handleShowNew = () => {
    setIsNewGroup(true);
  };

  const renderGroup = (group, index) => {
    if (index === selectedIndex) {
      return (
        <InputGroup>
          <FormControl
            value={Name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
          />
          <FormControl
            value={Comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Comentario"
          />
          <FormControl
            value={NumberOfStudents}
            onChange={(e) => setNumberOfStudents(e.target.value)}
            placeholder="# de Estudiantes"
            type="number"
          />
          <InputGroup.Append>
            <Button onClick={() => handleChangeGroup(index)}>Guardar</Button>
          </InputGroup.Append>
        </InputGroup>
      );
    } else {
      return (
        <div className="group-container">
          {group.Name}{" "}
          <Button onClick={() => handleEditGroup(group, index)}>Editar</Button>
        </div>
      );
    }
  };

  const handleEditGroup = (group, index) => {
    setSelectedIndex(index);
    setName(group.Name);
    setNumberOfStudents(group.NumberOfStudents);
    setComments(group.Comments);
  };
  const handleSave = async () => {
    try {
      await editStudentProperty(plan, student.slug, "groups", groups);
      newSuccessToast(`Grupos actualizados correctamente`);
      setGroups([]);
      handleClose();
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
      console.log(error);
    }
  };
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar grupos de {student.Name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {groups.map((group, index) => (
          <ListGroup.Item key={index}>
            {renderGroup(group, index)}
          </ListGroup.Item>
        ))}
        <ListGroup.Item>
          {isNewGroup ? (
            <InputGroup>
              <FormControl
                value={Name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
              />
              <FormControl
                value={Comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Comentario"
              />
              <FormControl
                value={NumberOfStudents}
                onChange={(e) => setNumberOfStudents(e.target.value)}
                placeholder="# de Estudiantes"
                type="number"
              />
              <InputGroup.Append>
                <Button onClick={handleAddNew}>Agregar</Button>
              </InputGroup.Append>
            </InputGroup>
          ) : (
            <Button onClick={handleShowNew}> Agregar Grupo </Button>
          )}
        </ListGroup.Item>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave}> Guardar </Button>
        <Button onClick={handleClose}> Cancelar </Button>
      </Modal.Footer>
    </Modal>
  );
};
