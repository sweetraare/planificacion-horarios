import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../App";
import AdminLayout from "../../HOC/AdminLayout";
import {
  Row,
  Col,
  Button,
  Accordion,
  Card,
  Table,
  Form,
} from "react-bootstrap";
import { getHoursList } from "../../services/firebase/operations/hoursList";
import { getDaysList } from "../../services/firebase/operations/daysList";
import { getTimeContraints } from "../../services/firebase/operations/timeConstraints";
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

import "./RestrictionPage.css";

export default () => {
  const { plan } = useContext(AuthContext);

  const [typeOfRestriction, setTypeOfRestriction] = useState("");
  const [hours, setHours] = useState({});
  const [days, setDays] = useState({});
  const [breakValues, setBreakValues] = useState([]);
  const [timeContraints, setTimeConstraints] = useState([]);
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

  useEffect(() => {
    async function fetchData() {
      try {
        const hoursFetched = await getHoursList();
        const daysFetched = await getDaysList();
        const timeConstraintsFetched = await getTimeContraints();
        const teachersFetched = await getTeachers(plan ? plan : " ");
        const subjectsFetched = await getSubjects(plan ? plan : " ");
        const studentsFetched = await getStudents(plan ? plan : " ");
        const activitiesFetched = await getActivities(plan ? plan : " ");
        const roomsFetched = await getSpaces(plan ? plan : " ", "rooms");
        const tagsFetched = await getTags(plan ? plan : " ");
        return {
          hoursFetched,
          daysFetched,
          timeConstraintsFetched,
          teachersFetched,
          subjectsFetched,
          studentsFetched,
          activitiesFetched,
          roomsFetched,
          tagsFetched,
        };
      } catch (error) {
        return error;
      }
    }
    fetchData().then((data) => {
      const {
        hoursFetched,
        daysFetched,
        timeConstraintsFetched,
        teachersFetched,
        subjectsFetched,
        studentsFetched,
        activitiesFetched,
        roomsFetched,
        tagsFetched,
      } = data;
      if (hoursFetched.exists()) {
        setHours(hoursFetched.val());
      }
      if (daysFetched.exists()) {
        setDays(daysFetched.val());
      }
      if (timeConstraintsFetched.exists()) {
        setTimeConstraints(toArray(timeConstraintsFetched.val()));
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
    });
  }, []);

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
    setSelectedHour(hour);
    setSelectedDay(day);
    setShowRestrictionModal(true);
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
                                        slug: sg.slug,
                                        Name: `${sg.Name} | ${g.Name} | ${s.Name}`,
                                      }))
                                    );
                                  }
                                  acc2 = acc2.concat({
                                    slug: g.slug,
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
              </Row>
            </Card.Body>
          </Card>
          <Table striped bordered>
            <thead>
              <tr>
                <th></th>
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
                        <td
                          onClick={() => handleSelectTime({ day, hour })}
                        ></td>
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
        teacher={"teacherName"}
        activity={"activityName"}
      />
      <NewRestrictionFormModal
        show={showNewRestrictionFormModal}
        handleClose={() => setNewShowRestrictionModal(false)}
        teacher={selectedTeacher}
        subject={selectedSubject}
        room={selectedRoom}
        students={selectedStudents}
        activity={selectedActivity}
        tag={selectedTag}
        teachersList={teachers}
        subjectsList={subjects}
        roomsList={rooms}
        studentsList={students}
        activitiesList={activities}
        tagsList={tags}
      />
    </AdminLayout>
  );
};
