import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../App";
import AdminLayout from "../../HOC/AdminLayout";
import { Row, Col, Button, Card, Table, Form } from "react-bootstrap";
import { getHoursList } from "../../services/firebase/operations/hoursList";
import { getDaysList } from "../../services/firebase/operations/daysList";
import { getTeachers } from "../../services/firebase/operations/teachers";
import { getSubjects } from "../../services/firebase/operations/subjects";
import { getStudents } from "../../services/firebase/operations/students";
import { getActivities } from "../../services/firebase/operations/activities";
import { getSpaces } from "../../services/firebase/operations/spaces";
import { getTags } from "../../services/firebase/operations/tags";
import toArray from "lodash/toArray";
import orderBy from "lodash/orderBy";
import RestrictionFormModal from "./components/RestrictionFormModal";
import NewRestrictionFormModal from "./components/NewRestrictionFormModal";
import {
  newSuccessToast,
  newInformationToast,
  newErrorToast,
} from "../../utils/toasts";
import {
  addBreakConstraint,
  getBreakContraints,
  removeAllBreakContraints,
  listenBreakContraints,
} from "../../services/firebase/operations/breakConstraint";
import {
  getTimeContraintsInput,
  listentimeContraintsInput,
} from "../../services/firebase/operations/timeConstraintsInput";

import "./RestrictionPage.css";

export default () => {
  const { plan } = useContext(AuthContext);

  const [hours, setHours] = useState({});
  const [days, setDays] = useState({});
  const [breakValues, setBreakValues] = useState([]);
  const [showRestrictionFormModal, setShowRestrictionModal] = useState(false);
  const [showNewRestrictionFormModal, setNewShowRestrictionModal] = useState(
    false
  );
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudents, setSelectedStudents] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tags, setTags] = useState([]);
  const [visibleActivities, setVisibleActivities] = useState([]);
  const [activitiesValues, setActivitiesValues] = useState([]);
  const [isAddingBreak, setIsAddingBreak] = useState(false);
  const [timeConstraints, setTimeConstraints] = useState([]);
  const [timeConstraintsVisible, setTimeConstraintsVisible] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const hoursFetched = await getHoursList();
        const daysFetched = await getDaysList();
        const teachersFetched = await getTeachers(plan ? plan : " ");
        const subjectsFetched = await getSubjects(plan ? plan : " ");
        const studentsFetched = await getStudents(plan ? plan : " ");
        const activitiesFetched = await getActivities(plan ? plan : " ");
        const roomsFetched = await getSpaces(plan ? plan : " ", "rooms");
        const tagsFetched = await getTags(plan ? plan : " ");
        const timeConstraintsFetched = await getTimeContraintsInput(
          plan ? plan : " "
        );
        const breakConstraintFetched = await getBreakContraints(
          plan ? plan : " "
        );
        return {
          hoursFetched,
          daysFetched,
          teachersFetched,
          subjectsFetched,
          studentsFetched,
          activitiesFetched,
          roomsFetched,
          tagsFetched,
          breakConstraintFetched,
          timeConstraintsFetched,
        };
      } catch (error) {
        return error;
      }
    }
    fetchData().then((data) => {
      const {
        hoursFetched,
        daysFetched,
        teachersFetched,
        subjectsFetched,
        studentsFetched,
        activitiesFetched,
        roomsFetched,
        tagsFetched,
        breakConstraintFetched,
        timeConstraintsFetched,
      } = data;
      if (hoursFetched.exists()) {
        setHours(hoursFetched.val());
      }
      if (daysFetched.exists()) {
        setDays(daysFetched.val());
      }
      if (teachersFetched.exists()) {
        setTeachers(toArray(teachersFetched.val()));
      }
      if (subjectsFetched.exists()) {
        setSubjects(toArray(subjectsFetched.val()));
      }
      if (studentsFetched.exists()) {
        setStudents(toArray(studentsFetched.val()));
      }
      if (activitiesFetched.exists()) {
        setActivities(toArray(activitiesFetched.val()));
      }
      if (roomsFetched.exists()) {
        setRooms(toArray(roomsFetched.val()));
      }
      if (tagsFetched.exists()) {
        setTags(toArray(tagsFetched.val()));
      }
      if (breakConstraintFetched.exists()) {
        setBreakValues(breakConstraintFetched.val());
      }
      if (timeConstraintsFetched.exists()) {
        setTimeConstraints(toArray(timeConstraintsFetched.val()));
        setTimeConstraintsVisible(toArray(timeConstraintsFetched.val()));
      }
    });
    listenBreakContraintsChange();
    listenTimeConstraintsInputChange();
  }, []);

  useEffect(() => {
    setActivitiesValues(
      activities.map((activity) => {
        const teacherFound = teachers.find(
          (teacher) => teacher.slug === activity.Teacher
        );
        const subjectFound = subjects.find(
          (subject) => subject.slug === activity.Subject
        );
        const studentsFound = students.find(
          (student) => student.slug === activity.Students
        );
        return {
          value: activity.slug,
          label: `id: ${activity.id} grupo: ${activity.ActivityGroup} duración: ${activity.Duration} | ${teacherFound.Name}, ${subjectFound.Name}, ${studentsFound.Name} `,
        };
      })
    );
  }, [activities]);

  const listenTimeConstraintsInputChange = () => {
    listentimeContraintsInput(plan ? plan : " ", (data) => {
      if (data.exists()) {
        setTimeConstraints(toArray(data.val()));
      }
    });
  };

  useEffect(() => {
    //TODO: add filters
    setTimeConstraintsVisible(timeConstraints);
  }, [timeConstraints]);

  const listenBreakContraintsChange = () => {
    listenBreakContraints(plan ? plan : " ", (breaks) => {
      if (breaks.exists()) {
        setBreakValues(breaks.val());
      }
    });
  };

  useEffect(() => {
    setVisibleActivities(
      activities
        .filter(
          (activity) =>
            (!selectedTeacher || activity.Teacher === selectedTeacher) &&
            (!selectedSubject || activity.Subject === selectedSubject) &&
            (!selectedStudents || activity.Students === selectedStudents)
        )
        .map((activity) => {
          const teacherFound = teachers.find(
            (teacher) => teacher.slug === activity.Teacher
          );
          const subjectFound = subjects.find(
            (subject) => subject.slug === activity.Subject
          );
          const studentsFound = students.find(
            (student) => student.slug === activity.Students
          );
          return {
            value: activity.slug,
            label: `id: ${activity.id} grupo: ${activity.ActivityGroup} duración: ${activity.Duration} | ${teacherFound.Name}, ${subjectFound.Name}, ${studentsFound.Name} `,
          };
        })
    );
  }, [selectedTeacher, selectedSubject, selectedStudents, activities]);

  const handleSelectTime = ({ day, hour }) => {
    if (isAddingBreak) {
      console.log({ day, hour, breakValues });
      const breakValueFound = breakValues.find(
        (bv) => bv.day === day && bv.hour === hour
      );
      if (breakValueFound) {
        setBreakValues(
          [...breakValues].filter((bv) => !(bv.day === day && bv.hour === hour))
        );
      } else {
        setBreakValues([...breakValues].concat({ day, hour }));
      }
    } else {
      setShowRestrictionModal(true);
      setSelectedHour(hour);
      setSelectedDay(day);
    }
  };

  const handleAddNew = () => {
    setNewShowRestrictionModal(true);
  };
  const handleClear = () => {
    setSelectedTeacher("");
    setSelectedSubject("");
    setSelectedRoom("");
    setSelectedStudents("");
    setSelectedActivity("");
    setSelectedTag("");
  };

  const handleClickBreak = () => {
    newInformationToast(
      `Por favor, seleccione en el horario de abajo las horas para receso.`
    );
    setIsAddingBreak(true);
  };
  const renderScheduleValue = ({ day, hour }) => {
    if (breakValues.find((bv) => bv.day === day && bv.hour === hour)) {
      return "--RECESO--";
    } else {
      const timeConstraintsFiltered = timeConstraintsVisible.filter(
        (tc) => tc.day === day && tc.hour === hour
      );
      return timeConstraintsFiltered.map((tc) => {
        if (tc.restrictionType === "teacher-not-available") {
          const teacherFound = teachers.find(
            (teacher) => teacher.slug === tc.teacher
          );
          return (
            <p>{`Profesor no disponible: ${
              teacherFound ? teacherFound.Name : ""
            }`}</p>
          );
        }

        if (tc.restrictionType === "activity-preferred-hour") {
          const activityFound = activitiesValues.find(
            (activity) => activity.value === tc.activity
          );
          return (
            <p>{`Actividad hora preferida: ${
              activityFound ? activityFound.label : ""
            }`}</p>
          );
        }
      });
    }
    return "";
  };

  const handleSaveBreak = async () => {
    try {
      setIsAddingBreak(false);
      await removeAllBreakContraints(plan ? plan : " ");
      await addBreakConstraint(plan ? plan : " ", breakValues);
      newSuccessToast(`Receso agregado de manera exitosa`);
    } catch (e) {
      console.log(e);
      newErrorToast(`ERROR: ${e.message}`);
    }
  };

  const handleCloseSpaceModal = () => {
    setNewShowRestrictionModal(false);
    handleClear();
  };

  return (
    <AdminLayout>
      <h1>Restricciones</h1>
      {plan ? (
        <>
          <Card className="filter-container">
            <Card.Title>Filtro</Card.Title>
            <Card.Body>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group as={Row}>
                    <Form.Label column sm={4}>
                      Profesor
                    </Form.Label>
                    <Col sm={8}>
                      <Form.Control
                        value={selectedTeacher}
                        as="select"
                        onChange={(event) =>
                          setSelectedTeacher(event.target.value)
                        }
                      >
                        <option value="" disabled>
                          ---
                        </option>
                        {teachers.map((teacher) => (
                          <option value={teacher.slug}>{teacher.Name}</option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column sm={4}>
                      Materia
                    </Form.Label>
                    <Col sm={8}>
                      <Form.Control
                        value={selectedSubject}
                        as="select"
                        onChange={(event) =>
                          setSelectedSubject(event.target.value)
                        }
                      >
                        <option value="" disabled>
                          ---
                        </option>
                        {subjects.map((subject) => (
                          <option value={subject.slug}>{subject.Name}</option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column sm={4}>
                      Aula
                    </Form.Label>
                    <Col sm={8}>
                      <Form.Control
                        value={selectedRoom}
                        as="select"
                        onChange={(event) =>
                          setSelectedRoom(event.target.value)
                        }
                      >
                        <option value="" disabled>
                          ---
                        </option>
                        {rooms.map((room) => (
                          <option value={room.slug}>{room.Name}</option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group as={Row}>
                    <Form.Label column sm={4}>
                      Estudiantes
                    </Form.Label>
                    <Col sm={8}>
                      <Form.Control
                        value={selectedStudents}
                        as="select"
                        onChange={(event) =>
                          setSelectedStudents(event.target.value)
                        }
                      >
                        <option value="" disabled>
                          ---
                        </option>
                        {orderBy(
                          students.reduce((acc, s) => {
                            if (s.groups) {
                              const subgroupsList = s.groups.reduce(
                                (acc2, g) => {
                                  if (g.subgroups) {
                                    acc2 = acc2.concat(
                                      g.subgroups.map((sg) => ({
                                        slug: sg.Name,
                                        Name: `${sg.Name} | ${g.Name} | ${s.Name}`,
                                      }))
                                    );
                                  }
                                  acc2 = acc2.concat({
                                    slug: g.Name,
                                    Name: `${g.Name} | ${s.Name}`,
                                  });
                                  return acc2;
                                },
                                []
                              );
                              acc = acc.concat(subgroupsList);
                            }
                            acc = acc.concat({
                              slug: s.slug,
                              Name: `${s.Name}`,
                            });
                            return acc;
                          }, []),
                          ["Name"],
                          ["asc"]
                        ).map((op) => {
                          return <option value={op.slug}>{op.Name}</option>;
                        })}
                      </Form.Control>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row}>
                    <Form.Label column sm={4}>
                      Actividades
                    </Form.Label>
                    <Col sm={8}>
                      <Form.Control
                        value={selectedActivity}
                        as="select"
                        onChange={(event) =>
                          setSelectedActivity(event.target.value)
                        }
                      >
                        <option value="" disabled>
                          ---
                        </option>
                        {visibleActivities.map((activity) => (
                          <option value={activity.value}>
                            {activity.label}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Form.Group>
                  <Form.Group as={Row}>
                    <Form.Label column sm={4}>
                      Código
                    </Form.Label>
                    <Col sm={8}>
                      <Form.Control
                        value={selectedTag}
                        as="select"
                        onChange={(event) => setSelectedTag(event.target.value)}
                      >
                        <option value="" disabled>
                          ---
                        </option>
                        {tags.map((tag) => (
                          <option value={tag.slug}>{tag.Name}</option>
                        ))}
                      </Form.Control>
                    </Col>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Button onClick={handleAddNew}>Agregar Restricción</Button>
                <Button onClick={handleClear}>Limpiar</Button>
                <Button onClick={handleClickBreak}>Receso</Button>
                {isAddingBreak && (
                  <Button onClick={handleSaveBreak}>Guardar Receso</Button>
                )}
              </Row>
            </Card.Body>
          </Card>
          <Table striped bordered responsive>
            <thead>
              <tr>
                <th style={{ minWidht: "20%" }}></th>
                {days.Days_List && days.Days_List.map((day) => <th> {day}</th>)}
              </tr>
            </thead>
            <tbody>
              {hours.Hours_List &&
                hours.Hours_List.map((hour) => (
                  <tr>
                    <td>{hour}</td>
                    {days.Days_List &&
                      days.Days_List.map((day) => (
                        <td onClick={() => handleSelectTime({ day, hour })}>
                          {renderScheduleValue({ day, hour })}
                        </td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </Table>
        </>
      ) : (
        <h1>
          Necesitas seleccionar un plan en la pantalla principal para continuar.
        </h1>
      )}
      <RestrictionFormModal
        show={showRestrictionFormModal}
        handleClose={() => setShowRestrictionModal(false)}
        day={selectedDay}
        hour={selectedHour}
        teacher={selectedTeacher}
        activity={selectedActivity}
        teachersList={teachers}
        activitiesList={activities.map((activity) => {
          const teacherFound = teachers.find(
            (teacher) => teacher.slug === activity.Teacher
          );
          const subjectFound = subjects.find(
            (subject) => subject.slug === activity.Subject
          );
          const studentsFound = students.find(
            (student) => student.slug === activity.Students
          );
          return {
            value: activity.slug,
            label: `id: ${activity.id} grupo: ${activity.ActivityGroup} duración: ${activity.Duration} | ${teacherFound.Name}, ${subjectFound.Name}, ${studentsFound.Name} `,
          };
        })}
      />
      <NewRestrictionFormModal
        show={showNewRestrictionFormModal}
        handleClose={handleCloseSpaceModal}
        subject={selectedSubject}
        room={selectedRoom}
        tag={selectedTag}
        roomsList={rooms}
        tagsList={tags}
        subjectsList={subjects}
      />
    </AdminLayout>
  );
};
