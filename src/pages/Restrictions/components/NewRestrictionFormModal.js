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
  subjectList,
  roomList,
  studetsList,
  activityList,
  tagList,
}) => {
  const { plan } = useContext(AuthContext);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Agregar nueva Restricción</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card.Body>
          <h3>Datos Seleccionados</h3>
          {teacher}
          {subject}
          {room}
          {students}
          {activity}
          {tag}
        </Card.Body>
      </Modal.Body>
    </Modal>
  );
};
