import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ListGroup,
  InputGroup,
  FormControl,
  ButtonGroup,
} from "react-bootstrap";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import {
  editStudentProperty,
  getStudents,
  listenStudents,
} from "../../../services/firebase/operations/students";
import { AuthContext } from "../../../App";
import "./StudentsGroupModal.css";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import toArray from "lodash/toArray";

export default ({ show, handleClose, student }) => {
  const { plan } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [NumberOfStudents, setNumberOfStudents] = useState("");
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        return await getStudents(plan ? plan : " ");
      } catch (error) {
        return error;
      }
    }

    fetchData()
      .then((data) => {
        if (data.exists()) {
          const studentsData = toArray(data.val()).reduce((acc, s) => {
            if (s.groups) {
              s.groups.forEach((g) => {
                if (g.subgroups) {
                  acc = acc.concat(g.subgroups);
                }
              });
              acc = acc.concat(s.groups);
            }
            acc = acc.concat(s);
            return acc;
          }, []);
          setNumberOfStudents(studentsData);
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenStudentsChange();
  }, []);

  const listenStudentsChange = () => {
    listenStudents(plan ? plan : " ", (data) => {
      if (data.exists()) {
        const studentsData = toArray(data.val()).reduce((acc, s) => {
          if (s.groups) {
            acc = acc.concat(s.groups);
            s.groups.forEach((g) => {
              if (g.subgroups) {
                acc = acc.concat(g.subgroups);
              }
            });
          }
          acc = acc.concat(s);
          return acc;
        }, []);
        setStudents(studentsData);
      }
    });
  };

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
          <ButtonGroup>
            <Button onClick={() => handleEditGroup(group, index)}>
              Editar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                window.confirm("Esta seguro de eliminar el grupo?");
              }}
            >
              Eliminar
            </Button>
          </ButtonGroup>
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
    if (
      students.find((s) =>
        groups.find((g) => g.Name.toUpperCase() === s.Name.toUpperCase())
      )
    ) {
      newErrorToast(`El grupo ${Name} ya existe`);
      return;
    }
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
