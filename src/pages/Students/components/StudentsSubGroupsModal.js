import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ListGroup,
  ButtonGroup,
  InputGroup,
  FormControl,
  Accordion,
  Card,
} from "react-bootstrap";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { editStudentProperty } from "../../../services/firebase/operations/students";
import { AuthContext } from "../../../App";
import "./StudentsGroupModal.css";

export default ({ show, handleClose, student }) => {
  const { plan } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [NumberOfStudents, setNumberOfStudents] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedIndexGroup, setSelectedIndexGroup] = useState(-1);

  useEffect(() => {
    setGroups(student.groups ? student.groups : []);
    setSelectedIndex(-1);
  }, [student]);

  const handleChangeGroup = (subgroupIndex, groupIndex) => {
    const groupsCopy = [...groups];
    const subgroupsCopy = groupsCopy[groupIndex].subgroups;
    subgroupsCopy[subgroupIndex] = { Name, NumberOfStudents, Comments };
    groupsCopy[groupIndex].subgroups = subgroupsCopy;
    setGroups(groupsCopy);
    setName("");
    setComments("");
    setNumberOfStudents("");
    setSelectedIndex(-1);
  };

  const handleAddNew = (group, index) => {
    const subgroupsCopy = group.subgroups ? group.subgroups : [];
    subgroupsCopy.push({ Name, Comments, NumberOfStudents });

    const groupsCopy = [...groups];
    groupsCopy[index].subgroups = subgroupsCopy;

    setGroups(groupsCopy);
    setName("");
    setComments("");
    setNumberOfStudents("");
  };

  const renderSubgroup = (subgroup, subgroupIndex, groupIndex) => {
    if (subgroupIndex === selectedIndex) {
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
            <Button
              onClick={() => handleChangeGroup(subgroupIndex, groupIndex)}
            >
              Guardar
            </Button>
          </InputGroup.Append>
        </InputGroup>
      );
    } else {
      return (
        <div className="group-container">
          {subgroup.Name}{" "}
          <Button
            onClick={() => handleEditGroup(subgroup, subgroupIndex, groupIndex)}
          >
            Editar
          </Button>
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
        <Modal.Title>Editar subgrupos de {student.Name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Accordion defaultActiveKey={0}>
          {groups.map((group, index) => (
            <Card>
              <Card.Header>
                <Accordion.Toggle as={Button} eventKey={index + 1}>
                  {group.Name}{" "}
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey={index + 1}>
                <Card.Body>
                  {group.subgroups &&
                    group.subgroups.map((subgroup, i) => (
                      <ListGroup.Item>
                        {renderSubgroup(subgroup, i, index)}
                      </ListGroup.Item>
                    ))}
                  <ListGroup.Item>
                    {selectedIndex === -1 && (
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
                          <Button onClick={() => handleAddNew(group, index)}>
                            Agregar
                          </Button>
                        </InputGroup.Append>
                      </InputGroup>
                    )}
                  </ListGroup.Item>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          ))}
        </Accordion>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave}> Guardar </Button>
        <Button onClick={handleClose}> Cancelar </Button>
      </Modal.Footer>
    </Modal>
  );
};
