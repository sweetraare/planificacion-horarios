import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col, Table } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { addActivity } from "../../../services/firebase/operations/activities";
import { getTeachers } from "../../../services/firebase/operations/teachers";
import { getStudents } from "../../../services/firebase/operations/students";
import { getSubjects } from "../../../services/firebase/operations/subjects";
import { getTags } from "../../../services/firebase/operations/tags";
import { AuthContext } from "../../../App";
import toArray from "lodash/toArray";

import "./ActivitiesFormModal.css";

export default ({ show, handleClose, action, tag }) => {
  const { plan } = useContext(AuthContext);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [Teachers, setTeachers] = useState([]);
  const [Students, setStudents] = useState([]);
  const [Tags, setTags] = useState([]);
  const [Subjects, setSubjects] = useState([]);
  const [studentsType, setStudentsType] = useState("year");
  // Visible variables
  const [visibleTeachers, setVisibleTeachers] = useState([]);
  const [visibleStudents, setVisibleStudents] = useState([]);
  const [visibleSubjects, setVisibleSubjects] = useState([]);
  const [visibleTags, setVisibleTags] = useState([]);
  // const [Subjects, setSubjects] = useState([]);
  const [Teacher, setTeacher] = useState({});
  const [Student, setStudent] = useState({});
  const [Tag, setTag] = useState({});
  const [Subject, setSubject] = useState({});
  // search variables
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [searchTag, setSearchTag] = useState("");
  const [searchSubject, setSearchSubject] = useState("");

  const [weight, setWeight] = useState(95);
  const [minDays, setMinDays] = useState(1);
  const [consecutive, setConsecutive] = useState(true);
  const [splitList, setSplitList] = useState([]);

  const [split, setSplit] = useState(1);
  //use effect to charge all lists
  useEffect(() => {
    async function fetchData() {
      try {
        const teachersFetched = await getTeachers(plan ? plan : " ");
        const studentsFetched = await getStudents(plan ? plan : " ");
        const subjectsFetched = await getSubjects(plan ? plan : " ");
        const tagsFetched = await getTags(plan ? plan : " ");
        return {
          teachersFetched,
          studentsFetched,
          subjectsFetched,
          tagsFetched,
        };
      } catch (error) {
        return error;
      }
    }

    fetchData()
      .then((data) => {
        const {
          teachersFetched,
          studentsFetched,
          subjectsFetched,
          tagsFetched,
        } = data;

        if (teachersFetched.exists()) {
          setTeachers(toArray(teachersFetched.val()));
          setVisibleTeachers(toArray(teachersFetched.val()));
        }
        if (studentsFetched.exists()) {
          setStudents(toArray(studentsFetched.val()));
          setVisibleStudents(toArray(studentsFetched.val()));
        }
        if (tagsFetched.exists()) {
          setTags(toArray(tagsFetched.val()));
          setVisibleTags(toArray(tagsFetched.val()));
        }
        if (subjectsFetched.exists()) {
          setSubjects(toArray(subjectsFetched.val()));
          setVisibleSubjects(toArray(subjectsFetched.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slug = action === "ADD" ? generateUniqueKey() : tag.slug;
      await addActivity(plan ? plan : " ", slug, {
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

  useEffect(() => {
    setVisibleSubjects(
      Subjects.filter((subject) => subject.Name.includes(searchSubject))
    );
  }, [searchSubject]);

  useEffect(() => {
    setVisibleTags(Tags.filter((tag) => tag.Name.includes(searchTag)));
  }, [searchTag]);

  useEffect(() => {
    setVisibleStudents(
      Students.filter((student) => student.Name.includes(searchStudent))
    );
  }, [searchStudent]);

  useEffect(() => {
    setVisibleTeachers(
      Teachers.filter((teacher) => teacher.Name.includes(searchTeacher))
    );
  }, [searchTeacher]);

  useEffect(() => {
    switch (studentsType) {
      case "year":
        setVisibleStudents(Students);
        break;
      case "group":
        setVisibleStudents(
          Students.reduce((acc, s) => {
            if (s.groups) {
              acc = acc.concat(
                s.groups.map((g) => ({ ...g, Name: `${s.Name} | ${g.Name}` }))
              );
            }
            return acc;
          }, [])
        );
        break;
      case "subgroup":
        const subgroupsList = Students.reduce((acc, s) => {
          if (s.groups) {
            acc = acc.concat(
              s.groups.map((g) => ({ ...g, Name: `${s.Name} | ${g.Name}` }))
            );
          }
          return acc;
        }, []);

        setVisibleStudents(
          subgroupsList.reduce((acc, g) => {
            if (g.subgroups) {
              acc = acc.concat(
                g.subgroups.map((sg) => ({
                  ...sg,
                  Name: `${g.Name} | ${sg.Name}`,
                }))
              );
            }
            return acc;
          }, [])
        );

        break;

      default:
    }
  }, [studentsType]);

  const handleSelect = (set, value) => {
    set(value);
  };

  const createTableHeader = () => {
    const response = [];

    for (let i = 0; i < minDays; i++) {
      response.push(<th className="table-column">{i + 1}</th>);
    }
    return response;
  };

  const createTableBody = () => {
    const response = [];

    for (let i = 0; i < minDays; i++) {
      response.push(
        <td>
          <Form.Control
            className="table-column"
            name="title_en"
            type="number"
            value={splitList[i] ? splitList[i] : ""}
            onChange={(event) => handleChangeSplit(event.target.value, i)}
          />
        </td>
      );
    }
    return response;
  };

  const handleChangeSplit = (value, index) => {
    const splitListCopy = [...splitList];

    splitListCopy[index] = +value;

    setSplitList(splitListCopy);
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton size="lg">
        <Modal.Title>
          {" "}
          {action === "ADD" ? "Agregar Códigos" : "Editar Código"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={6} className="select-container border rounded">
            <div className="select-title">
              <h4> Profesores </h4>
              <Form.Control
                placeholder="Buscar"
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
              />
            </div>
            {visibleTeachers.map((teacher) => (
              <div
                className="item-name"
                onClick={() => handleSelect(setTeacher, teacher)}
              >
                {teacher.Name}
              </div>
            ))}
          </Col>
          <Col xs={6} className="select-container border rounded">
            <div className="select-title">
              <h4> Categorías </h4>
              <Form.Control
                placeholder="Buscar"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
              />
            </div>
            {visibleTags.map((tag) => (
              <div
                className="item-name"
                onClick={() => handleSelect(setTag, tag)}
              >
                {tag.Name}
              </div>
            ))}
          </Col>
          <Col xs={6} className="select-container border rounded">
            <div className="select-title">
              <h4> Estudiantes </h4>
              <Form.Control
                as="select"
                value={studentsType}
                onChange={(e) => setStudentsType(e.target.value)}
              >
                <option value="year">Año </option>
                <option value="group">Grupo </option>
                <option value="subgroup">Subgrupo </option>
              </Form.Control>
              <Form.Control
                placeholder="Buscar"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
            {visibleStudents.map((student) => (
              <div
                className="item-name"
                onClick={() => handleSelect(setStudent, student)}
              >
                {student.Name}
              </div>
            ))}
          </Col>
          <Col xs={6} className="select-container border rounded">
            <div className="select-title">
              <h4> Materias </h4>
              <Form.Control
                placeholder="Buscar"
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
              />
            </div>
            {visibleSubjects.map((subject) => (
              <div
                className="item-name"
                onClick={() => handleSelect(setSubject, subject)}
              >
                {subject.Name}
              </div>
            ))}
          </Col>
        </Row>
        <hr />
        <div>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Profesor seleccionado:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="name"
                type="text"
                value={Teacher.Name}
                readOnly
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Categoría seleccionada:
            </Form.Label>
            <Col sm={8}>
              <Form.Control name="name" type="text" value={Tag.Name} readOnly />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Estudiante seleccionado:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="name"
                type="text"
                value={Student.Name}
                readOnly
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Materia seleccionada:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="name"
                type="text"
                value={Subject.Name}
                readOnly
              />
            </Col>
          </Form.Group>
        </div>
        <hr />
        <div>
          <Form.Group as={Row}>
            <Form.Label column sm={4}>
              Dividir:
            </Form.Label>
            <Col sm={8}>
              <Form.Control
                name="divide"
                type="number"
                min={1}
                max={35}
                value={split}
                onChange={(e) => setSplit(+e.target.value)}
              />
            </Col>
          </Form.Group>
          <Row>
            <Col xs={6}>
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Disivión</th>
                    {createTableHeader()}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {" "}
                    <th>Duración</th>
                    {createTableBody()}
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col xs={6}>
              <Form.Group as={Row}>
                <Form.Label column sm={4}>
                  Min días:
                </Form.Label>
                <Col sm={8}>
                  <Form.Control
                    name="divide"
                    type="number"
                    min={1}
                    max={35}
                    value={minDays}
                    onChange={(e) => setMinDays(+e.target.value)}
                  />
                </Col>
              </Form.Group>
              {minDays > 1 && (
                <>
                  <Form.Group as={Row}>
                    <Form.Label column sm={4}>
                      Peso:
                    </Form.Label>
                    <Col sm={8}>
                      <Form.Control
                        name="divide"
                        type="number"
                        min={0}
                        max={100}
                        value={weight}
                        onChange={(e) => setWeight(+e.target.value)}
                      />
                    </Col>
                  </Form.Group>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      label="Consecutiva"
                      value={consecutive}
                      checked={consecutive}
                      onClick={() => setConsecutive(!consecutive)}
                    />
                  </Form.Group>
                </>
              )}
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
        <Button variant="secondary" className="ml-3" onClick={handleClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
