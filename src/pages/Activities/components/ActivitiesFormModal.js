import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col, Table } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import {
  addActivity,
  getActivities,
  listenActivities,
} from "../../../services/firebase/operations/activities";
import { addTimeConstraint } from "../../../services/firebase/operations/timeConstraints";
import { getTeachers } from "../../../services/firebase/operations/teachers";
import { getStudents } from "../../../services/firebase/operations/students";
import { getSubjects } from "../../../services/firebase/operations/subjects";
import { getTags } from "../../../services/firebase/operations/tags";
import { AuthContext } from "../../../App";
import toArray from "lodash/toArray";
import isEmpty from "lodash/isEmpty";

import "./ActivitiesFormModal.css";

export default ({ show, handleClose, action, tag }) => {
  const { plan } = useContext(AuthContext);

  const [activities, setActivities] = useState([]);

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
  const [maxID, setMaxID] = useState(0);

  const [split, setSplit] = useState(1);
  //use effect to charge all lists
  useEffect(() => {
    async function fetchData() {
      try {
        const teachersFetched = await getTeachers(plan ? plan : " ");
        const studentsFetched = await getStudents(plan ? plan : " ");
        const subjectsFetched = await getSubjects(plan ? plan : " ");
        const activitiesFetched = await getActivities(plan ? plan : " ");
        const tagsFetched = await getTags(plan ? plan : " ");
        return {
          teachersFetched,
          studentsFetched,
          subjectsFetched,
          tagsFetched,
          activitiesFetched,
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
          activitiesFetched,
        } = data;

        if (activitiesFetched.exists()) {
          setActivities(toArray(activitiesFetched.val()));
        }

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
    listenActivitiesChange();
  }, []);

  useEffect(() => {
    const maxIDObject = activities.reduce(
      (a, b) => (a ? (a.id > b.id ? a : b) : b),
      null
    );
    setMaxID(maxIDObject ? maxIDObject.id : 0);
  }, [activities]);

  const listenActivitiesChange = () => {
    listenActivities(plan ? plan : " ", (activities) => {
      if (activities.exists()) {
        setActivities(toArray(activities.val()));
      }
    });
  };

  const clearVariables = () => {
    setVisibleTeachers(Teachers);
    setVisibleStudents(Students);
    setVisibleSubjects(Subjects);
    setVisibleTags(Tags);
    setTeacher({});
    setStudent({});
    setTag({});
    setSubject({});
    setSearchTeacher("");
    setSearchStudent("");
    setSearchTag("");
    setSearchSubject("");
    setWeight(95);
    setMinDays(1);
    setConsecutive(true);
    setSplitList([]);
    setMaxID(0);
    setSplit(1);
  };

  const handleSave = async () => {
    try {
      if (
        isEmpty(Teacher) ||
        isEmpty(Subject) ||
        isEmpty(Tag) ||
        isEmpty(Student)
      ) {
        newErrorToast(`Uno de los campos no se ha seleccionado`);
        return;
      }
      const newActivity = {
        slug: generateUniqueKey(),
        Teacher: Teacher.slug,
        Subject: Subject.slug,
        Tag: Tag.slug,
        Students: Student.slug,
        Active: true,
        id: maxID + 1,
      };
      if (split === 1) {
        if (!splitList[0]) {
          newErrorToast(`Duración no definida`);
        } else {
          newActivity.ActivityGroup = 0;
          newActivity.Duration = splitList[0];
          newActivity.TotalDuration = splitList[0];
          await addActivity(plan ? plan : " ", newActivity.slug, newActivity);
        }
      } else {
        const newTimeContraint = `<ConstraintMinDaysBetweenActivities><Weight_Percentage>${+weight}</Weight_Percentage>
	<Consecutive_If_Same_Day>${consecutive}</Consecutive_If_Same_Day>
	<Number_of_Activities>${splitList.length}</Number_of_Activities>
  ${splitList.map((s, i) => `<Activity_Id>${maxID + i + 1}</Activity_Id>`)}
	<MinDays>${minDays}</MinDays>
	<Active>true</Active>
	<Comments></Comments>
          </ConstraintMinDaysBetweenActivities>`;
        console.log(newTimeContraint);
        if (splitList.every((s) => +s)) {
          const totalDuration = splitList.reduce((acc, s) => acc + s);
          splitList.forEach(async (s, index) => {
            const newActivity = {
              slug: generateUniqueKey(),
              Teacher: Teacher.slug,
              Subject: Subject.slug,
              Tag: Tag.slug,
              Students: Student.slug,
              Active: true,
              Duration: s,
              TotalDuration: totalDuration,
              id: maxID + index + 1,
              ActivityGroup: maxID + 1,
            };

            await addActivity(plan ? plan : " ", newActivity.slug, newActivity);
          });

          await addTimeConstraint(plan ? plan : " ", newTimeContraint);
        } else {
          newErrorToast(`Alguna duración no está definida`);
        }
      }
      newSuccessToast(`Actividad ingresada exitosamente`);
      clearVariables();
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
    }
  };

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

    for (let i = 0; i < split; i++) {
      response.push(<th className="table-column">{i + 1}</th>);
    }
    return response;
  };

  const createTableBody = () => {
    const response = [];

    for (let i = 0; i < split; i++) {
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
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton size="lg">
        <Modal.Title>
          {" "}
          {action === "ADD" ? "Agregar Códigos" : "Editar Código"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={12} md={6}>
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
          </Col>
          <Col xs={12} md={6}>
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
                  <Form.Control
                    name="name"
                    type="text"
                    value={Tag.Name}
                    readOnly
                  />
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
                  {split > 1 && (
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
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSave} variant="primary">
          Guardar
        </Button>
        <Button variant="secondary" className="ml-3" onClick={handleClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
