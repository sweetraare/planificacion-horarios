import React, { useContext, useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import {
  addTeacher,
  editTeacherProperty,
} from "../../../services/firebase/operations/teachers";

import "./QualifiedSubjectsModal.css";

export default ({ show, handleClose, subjects, teacher }) => {
  const { plan } = useContext(AuthContext);

  const [QualifiedSubjects, setQualifiedSubjects] = useState([]);
  const [avaibleSubjects, setAvaibleSubjects] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setQualifiedSubjects(
      teacher.QualifiedSubjects ? teacher.QualifiedSubjects : []
    );
    setAvaibleSubjects(
      subjects.filter((subject) => {
        if (teacher.QualifiedSubjects) {
          return !teacher.QualifiedSubjects.includes(subject.slug);
        } else {
          return true;
        }
      })
    );
  }, [teacher, subjects]);

  const handleAddSubject = (subject) => {
    const QualifiedSubjectsCopy = [...QualifiedSubjects];
    QualifiedSubjectsCopy.push(subject.slug);
    setAvaibleSubjects(
      subjects.filter((subject) => {
        return !QualifiedSubjectsCopy.includes(subject.slug);
      })
    );
    setQualifiedSubjects(QualifiedSubjectsCopy);
  };

  const handleRemoveSubject = (subject) => {
    const QualifiedSubjectsCopy = [...QualifiedSubjects].filter(
      (s) => s !== subject
    );
    setAvaibleSubjects(
      subjects.filter((subject) => {
        return !QualifiedSubjectsCopy.includes(subject.slug);
      })
    );
    setQualifiedSubjects(QualifiedSubjectsCopy);
  };

  const handleAll = () => {
    setQualifiedSubjects(subjects.map((subject) => subject.slug));
    setAvaibleSubjects([]);
  };

  const handleDelete = () => {
    setQualifiedSubjects([]);
    setAvaibleSubjects(subjects);
  };

  const handleSave = async () => {
    try {
      await editTeacherProperty(
        plan,
        teacher.slug,
        "QualifiedSubjects",
        QualifiedSubjects
      );
      newSuccessToast("Materias agregadas al profesor con éxito");
      setAvaibleSubjects([]);
      setQualifiedSubjects([]);
      handleClose();
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
    }
  };

  useEffect(() => {
    setQualifiedSubjects(
      teacher.QualifiedSubjects ? teacher.QualifiedSubjects : []
    );
  }, [teacher]);

  useEffect(() => {
    if (search) {
      setAvaibleSubjects(
        subjects.filter((subject) => subject.Name.includes(search))
      );
    } else {
      setAvaibleSubjects(subjects);
    }
  }, [search]);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Materias que enseña el profesor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col xs={6} className="subjects-container">
            <h4>Materias</h4>
            <hr />
            <Form.Group as={Row}>
              <Form.Label column sm={4}>
                Búsqueda:
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Col>
            </Form.Group>
            <hr />
            {avaibleSubjects.map((subject, index) => (
              <div
                className="subject-name"
                key={index}
                onDoubleClick={() => handleAddSubject(subject)}
              >
                {subject.Name}
              </div>
            ))}
          </Col>
          <Col xs={6} className="subjects-container">
            <h4>Seleccionadas</h4>
            <hr />
            {QualifiedSubjects.map((subject, index) => (
              <div
                className="subject-name"
                key={index}
                onDoubleClick={() => handleRemoveSubject(subject)}
              >
                {subjects.find((s) => s.slug === subject).Name}
              </div>
            ))}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Form.Group>
          <Button variant="secondary" className="ml-3" onClick={handleAll}>
            Todas
          </Button>
          <Button variant="danger" className="ml-3" onClick={handleDelete}>
            Eliminar
          </Button>
          <Button variant="primary" className="ml-3" onClick={handleSave}>
            Guardar
          </Button>
          <Button variant="secondary" className="ml-3" onClick={handleClose}>
            Cancelar
          </Button>
        </Form.Group>
      </Modal.Footer>
    </Modal>
  );
};
