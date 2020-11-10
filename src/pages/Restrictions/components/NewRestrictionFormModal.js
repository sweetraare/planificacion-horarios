import React, { useContext, useEffect, useState } from "react";
import { Card, Button, Modal, Form, Row, Col } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";
import { RESTRICTION_TYPES } from "../../../constants/restrictionTypes";
import { addTimeConstraintInput } from "../../../services/firebase/operations/timeConstraintsInput";

export default ({
  show,
  handleClose,
  day,
  hour,
  teacher,
  subject,
  room,
  students,
  activity,
  tag,
  teachersList,
  subjectsList,
  roomsList,
  studentsList,
  activitiesList,
  tagsList,
}) => {
  const { plan } = useContext(AuthContext);

  console.log(studentsList);
  const [selectedTeacher, setSelectedTeacher] = useState({});
  const [selectedSubject, setSelectedSubject] = useState({});
  const [selectedRoom, setSelectedRoom] = useState({});
  const [selectedActivity, setSelectedActivity] = useState({});
  const [selectedTag, setSelectedTag] = useState({});
  const [selectedStudents, setSelectedStudents] = useState({});

  useEffect(() => {
    const teacherFound = teachersList.find((t) => t.slug === teacher);
    teacherFound && setSelectedTeacher(teacherFound);
  }, [teacher]);

  useEffect(() => {
    const subjectFound = subjectsList.find((s) => s.slug === subject);
    subjectFound && setSelectedSubject(subjectFound);
  }, [subject]);

  useEffect(() => {
    const roomFound = roomsList.find((s) => s.slug === room);
    roomFound && setSelectedRoom(roomFound);
  }, [room]);

  useEffect(() => {
    const studentsFound = studentsList.find((s) => s.slug === students);
    console.log("selectedStudents", students);
    studentsFound && setSelectedStudents(studentsFound);
  }, [students]);

  useEffect(() => {
    const activityFound = activitiesList.find((a) => a.slug === activity);
    if (activityFound) {
      const subjectFound = subjectsList.find(
        (s) => s.slug === activityFound.Subject
      );
      const teacherFound = teachersList.find(
        (t) => t.slug === activityFound.Teacher
      );
      const studentsFound = studentsList.find(
        (s) => s.slug === activityFound.Students
      );

      setSelectedActivity({
        slug: activityFound.slug,
        id: activityFound.id,
        ActivityGroup: activityFound.ActivityGroup,
        Duration: activityFound.Duration,
        teacher: teacherFound,
        subject: subjectFound,
        students: studentsFound,
      });
    }
  }, [activity]);

  useEffect(() => {
    const tagFound = tagsList.find((t) => t.slug === tag);
    tagFound && setSelectedTag(tagFound);
  }, [tag]);

  const renderConstraintTypes = () => {
    const options = [];
    // space constraints
    if (selectedSubject.slug && selectedRoom.slug) {
      //TODO implement how to choose which rooms
      options.push(
        <option>
          Materia ({selectedSubject.Name}) tiene un Aula preferida (
          {selectedRoom.Name})
        </option>
      );
    }
    if (selectedSubject.slug) {
      options.push(
        <option>
          Materia ({selectedSubject.Name}) tiene un grupo de aulas preferidas
        </option>
      );
    }
    if (selectedTag.slug) {
      options.push(
        <option>
          Categoría ({selectedTag.Name}) tiene un grupo de aulas preferidas
        </option>
      );
    }
    if (selectedTag.slug && selectedRoom.slug) {
      //TODO implement how to choose which rooms
      options.push(
        <option>
          Categoría ({selectedTag.Name}) tiene un Aula preferida (
          {selectedRoom.Name})
        </option>
      );
    }
    return options;
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Agregar nueva Restricción</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card.Body>
          <h3>Datos Seleccionados</h3>
          <p>{`Profesor: ${
            selectedTeacher.Name ? selectedTeacher.Name : ""
          }`}</p>
          <p>{`Materia: ${
            selectedSubject.Name ? selectedSubject.Name : ""
          }`}</p>
          <p>{`Aula: ${selectedRoom.Name ? selectedRoom.Name : ""}`}</p>
          <p>{`Estudiantes: ${
            selectedStudents.Name ? selectedStudents.Name : ""
          }`}</p>
          <p>{`Código: ${selectedTag.Name ? selectedTag.Name : ""}`}</p>
          <p>
            Actividad:
            {selectedActivity.id
              ? `id: ${selectedActivity.id} grupo: ${selectedActivity.ActivityGroup} duración: ${selectedActivity.Duration} | ${selectedActivity.teacher.Name}, ${selectedActivity.subject.Name}, ${selectedActivity.students.Name} `
              : ""}
          </p>
          <Form.Group>
            <Form.Label>
              En base a lo seleccionado, puedes crear una de las siguientes
              restricciones
            </Form.Label>
            <Form.Control
              value={selectedTeacher}
              as="select"
              onChange={(event) => setSelectedTeacher(event.target.value)}
            >
              <option value="" disabled>
                ---
              </option>
              {renderConstraintTypes()}
            </Form.Control>
          </Form.Group>
        </Card.Body>
      </Modal.Body>
    </Modal>
  );
};
