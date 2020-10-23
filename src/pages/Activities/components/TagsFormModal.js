import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { addActivity } from "../../../services/firebase/operations/activities";
import { getTeachers } from "../../../services/firebase/operations/teachers";
import { getStudents } from "../../../services/firebase/operations/students";
import { getSubjects } from "../../../services/firebase/operations/subjects";
import { getTags } from "../../../services/firebase/operations/tags";
import { AuthContext } from "../../../App";
import toArray from "lodash/toArray";

export default ({ show, handleClose, action, tag }) => {
  const { plan } = useContext(AuthContext);
  const [Name, setName] = useState("");
  const [Comments, setComments] = useState("");
  const [Teachers, setTeachers] = useState([]);
  const [Students, setStudents] = useState([]);
  const [Tags, setTags] = useState([]);
  const [Subjects, setSubjects] = useState([]);
  // Visible variables
  const [visibleTeachers, setVisibleTeachers] = useState([]);
  const [visibleStudents, setVisibleStudents] = useState([]);
  // const [Subjects, setSubjects] = useState([]);
  const [Teacher, setTeacher] = useState("");
  const [Student, setStudent] = useState("");
  const [Tag, setTag] = useState("");
  const [Subject, setSubject] = useState("");

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
        }
        if (subjectsFetched.exists()) {
          setSubjects(toArray(subjectsFetched.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));
  }, []);

  useEffect(() => {
    setName(tag.Name ? tag.Name : "");
    setComments(tag.Comments ? tag.Comments : "");
  }, [tag]);

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

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {" "}
          {action === "ADD" ? "Agregar Códigos" : "Editar Código"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={3}>
            <h4> Profesores </h4>
            {visibleTeachers.map((teacher) => (
              <p>{teacher.Name}</p>
            ))}
          </Col>
          <Col xs={3}>
            <h4> Categorías </h4>
            {Tags.map((tag) => (
              <p>{tag.Name}</p>
            ))}
          </Col>
          <Col xs={3}>
            <h4> Estudiantes </h4>
            {visibleStudents.map((student) => (
              <p>{student.Name}</p>
            ))}
          </Col>
          <Col xs={3}>
            <h4> Materias </h4>
            {Subjects.map((subject) => (
              <p>{subject.Name}</p>
            ))}
          </Col>
        </Row>
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
