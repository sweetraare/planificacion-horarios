import React, { useEffect, useState } from "react";
import {
  InputGroup,
  FormControl,
  Table,
  Button,
  Modal,
  Tabs,
  Tab,
} from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import toArray from "lodash/toArray";
import {
  addPlan,
  setAllPlanData,
} from "../../../services/firebase/operations/plans";

import "./ImportDataModal.css";

export default ({ show, handleClose, FETData, plans }) => {
  const [newPlanName, setNewPlanName] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [tags, setTags] = useState([]);
  const [activities, setActivities] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [breakContraints, setBreakConstraints] = useState([]);
  const [teacherNotAvailable, setTeacherNotAvailable] = useState([]);
  const [activityPreferredHour, setActivityPreferredHour] = useState([]);

  useEffect(() => {
    setTeachers(FETData && FETData.Teachers ? FETData.Teachers : []);
    setSubjects(FETData && FETData.Subjects ? FETData.Subjects : []);
    setStudents(
      FETData && FETData.Students ? FETData.Students.map(formatStudents) : []
    );
    setTags(FETData && FETData.Tags ? FETData.Tags : []);
    setActivities(FETData && FETData.Activities ? FETData.Activities : []);
    setBuildings(FETData && FETData.Buildings ? FETData.Buildings : []);
    setRooms(FETData && FETData.Rooms ? FETData.Rooms : []);
    setTeacherNotAvailable(
      FETData && FETData.ConstraintTeacherNotAvailableTimes
        ? FETData.ConstraintTeacherNotAvailableTimes.reduce(
            (acc, constraint) => {
              constraint.Not_Available_Time.forEach((i) => {
                acc.push({
                  Teacher: constraint.Teacher,
                  Day: i.Day,
                  Hour: i.Hour,
                });
              });
              return acc;
            },
            []
          )
        : []
    );
    setBreakConstraints(
      FETData && FETData.BreakConstraints ? FETData.BreakConstraints : []
    );
    setActivityPreferredHour(
      FETData && FETData.ConstraintActivityPreferredStartingTime
        ? FETData.ConstraintActivityPreferredStartingTime
        : []
    );
  }, [FETData]);

  const formatStudents = (year) => {
    const newYearObject = {
      Name: year.Name[0],
      Comments: year.Comments[0],
      NumberOfStudents: +year.Number_of_Students[0],
    };
    if (year.Group) {
      newYearObject.groups = year.Group.map((group) => {
        const newGroupObject = {
          Name: group.Name[0],
          Comments: group.Comments[0],
          NumberOfStudents: +group.Number_of_Students[0],
        };
        if (group.Subgroup) {
          newGroupObject.subgroups = group.Subgroup.map((subgroup) => {
            const newSubgroupObject = {
              Name: subgroup.Name[0],
              Comments: subgroup.Comments[0],
              NumberOfStudents: +subgroup.Number_of_Students[0],
            };
            return newSubgroupObject;
          });
        }
        return newGroupObject;
      });
    }
    return newYearObject;
  };

  const handleSave = async () => {
    if (plans.find((p) => p.toUpperCase() === newPlanName.toUpperCase())) {
      newErrorToast(`ERROR: El plan ${newPlanName}, ya existe`);
      return;
    }

    if (!newPlanName) {
      newErrorToast(`ERROR: El nombre del plan no puede estar vacío`);
      return;
    }

    try {
      const subjectsToImport = subjects.reduce((acc, subject) => {
        const slug = generateUniqueKey();
        acc[slug] = {
          slug,
          Name: subject.Name,
          Comments: subject.Comments,
        };
        return acc;
      }, {});

      const tagsToImport = tags.reduce((acc, tag) => {
        const slug = generateUniqueKey();
        acc[slug] = {
          slug,
          Name: tag.Name,
          Comments: tag.Comments,
        };
        return acc;
      }, {});

      const studentsToImport = students.reduce((acc, student) => {
        const slug = generateUniqueKey();
        acc[slug] = {
          slug,
          Name: student.Name,
          Comments: student.Comments,
          NumberOfStudents: student.NumberOfStudents,
        };
        return acc;
      }, {});

      const buildingsToImport = buildings.reduce((acc, student) => {
        const slug = generateUniqueKey();
        acc[slug] = {
          slug,
          Name: student.Name,
          Comments: student.Comments,
        };
        return acc;
      }, {});

      const roomsToImport = rooms.reduce((acc, room) => {
        const slug = generateUniqueKey();
        const buildingFound = toArray(buildingsToImport).find(
          (building) => building.Name === room.Building
        );
        acc[slug] = {
          slug,
          Name: room.Name,
          Comments: room.Comments,
          Building: buildingFound ? buildingFound.slug : "",
          Capacity: room.Capacity,
        };
        return acc;
      }, {});

      const spacesToImport = {
        rooms: roomsToImport,
        building: buildingsToImport,
      };

      const teachersToImport = teachers.reduce((acc, teacher) => {
        const slug = generateUniqueKey();
        const QualifiedSubjects =
          teacher.QualifiedSubjects &&
          teacher.QualifiedSubjects.map((qs) => {
            const subjectFound = toArray(subjectsToImport).find(
              (s) => s.Name === qs
            );
            return subjectFound ? subjectFound.slug : "";
          });

        acc[slug] = {
          slug,
          Name: teacher.Name,
          Comments: teacher.Comments,
          TargetNumberOfHours: teacher.TargetNumberOfHours,
        };
        if (QualifiedSubjects) {
          acc[slug].QualifiedSubjects = QualifiedSubjects;
        }
        return acc;
      }, {});

      const activitiesToImport = activities.reduce((acc, activity) => {
        const slug = generateUniqueKey();

        const activityStudents =
          activity.Students &&
          activity.Students.map((as) => {
            const sf = toArray(studentsToImport).find((s) => s.Name === as);
            return sf ? sf.slug : "";
          });

        const subjectFound = toArray(subjectsToImport).find(
          (s) => s.Name === activity.Subject
        );

        const tagFound = toArray(tagsToImport).find(
          (t) => t.Name === activity.ActivityTag
        );

        const teacherFound = toArray(teachersToImport).find(
          (t) => t.Name === activity.Teacher
        );

        acc[slug] = {
          Active: true,
          ActivityGroup: activity.ActivityGroupId,
          Duration: +activity.Duration,
          Students: activityStudents,
          Subject: subjectFound ? subjectFound.slug : "",
          Tag: tagFound ? tagFound.slug : "",
          Teacher: teacherFound ? teacherFound.slug : "",
          TotalDuration: activity.TotalDuration,
          id: activity.Id,
          slug,
        };
        return acc;
      }, {});

      const teacherNotAvailableToImport = teacherNotAvailable.reduce(
        (acc, tna) => {
          const slug = generateUniqueKey();
          const teacherFound = toArray(teachersToImport).find(
            (t) => t.Name === tna.Teacher
          );
          acc[slug] = {
            slug,
            day: tna.Day[0],
            hour: tna.Hour[0],
            restrictionType: "teacher-not-available",
            teacher: teacherFound ? teacherFound.slug : "",
          };
          return acc;
        },
        {}
      );

      const activityPreferredHourToImport = activityPreferredHour.reduce(
        (acc, aph) => {
          const slug = generateUniqueKey();
          const activityFound = toArray(activitiesToImport).find(
            (a) => a.id === +aph.Activity_Id
          );
          acc[slug] = {
            slug,
            day: aph.Preferred_Day[0],
            hour: aph.Preferred_Hour[0],
            restrictionType: "activity-preferred-hour",
            activity: activityFound ? activityFound.slug : "",
          };
          return acc;
        },
        {}
      );

      const planObject = {
        activities: activitiesToImport,
        breakContraints: breakContraints.map((bc) => ({
          day: bc.Day[0],
          hour: bc.Hour[0],
        })),
        spaces: spacesToImport,
        students: studentsToImport,
        subjects: subjectsToImport,
        tags: tagsToImport,
        teachers: teachersToImport,
        timeContraintsInput: {
          ...teacherNotAvailableToImport,
          ...activityPreferredHourToImport,
        },
      };

      await addPlan(newPlanName);
      await setAllPlanData(newPlanName, planObject);
      newSuccessToast(`Datos importados con éxito`);
      handleClose();
    } catch (e) {
      console.log(e);
      newErrorToast(`ERROR: ${e.message}`);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Datos a importar</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs>
          <Tab eventKey="teachers" title="Profesores">
            <h1>Profesores</h1>
            <Table responsive striped bordered size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Comentario</th>
                  <th>Horas Objetivo</th>
                  <th>Materias</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{teacher.Name}</td>
                    <td>{teacher.Comments}</td>
                    <td>{teacher.TargetNumberOfHours}</td>
                    <td>
                      <ul>
                        {teacher.QualifiedSubjects &&
                          teacher.QualifiedSubjects.map((subject) => (
                            <li>{subject}</li>
                          ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="subject" title="Materias">
            <h1>Materias</h1>
            <Table responsive striped bordered size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{subject.Name}</td>
                    <td>{subject.Comments}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="students" title="Estudiantes">
            <h1>Estudiantes</h1>
            <Table responsive striped bordered size="sm">
              <thead>
                <tr>
                  <th>Año</th>
                  <th>Grupo</th>
                  <th>Subgrupo</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr>
                    <td>{student.Name}</td>
                    <td>
                      <ul>
                        {student.groups &&
                          student.groups.map((g) => <li>{g.Name}</li>)}
                      </ul>
                    </td>
                    <td>
                      <ul>
                        {student.groups &&
                          student.groups
                            .reduce((acc, g) => {
                              if (g.subgroups) {
                                acc = acc.concat(g.subgroups);
                              }
                              return acc;
                            }, [])
                            .map((sg) => <li>{sg.Name}</li>)}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <ul>
              {students.map((students) => (
                <li>{JSON.stringify(students)}</li>
              ))}
            </ul>
          </Tab>
          <Tab eventKey="places" title="Lugares">
            <h1>Lugares</h1>
            <h3>Edificios</h3>
            <Table responsive striped bordered size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{building.Name}</td>
                    <td>{building.Comments}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <h3>Aulas</h3>
            <Table responsive striped bordered size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Comentario</th>
                  <th>Edificio</th>
                  <th>Capacidad</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{room.Name}</td>
                    <td>{room.Comments}</td>
                    <td>{room.Buildings}</td>
                    <td>{room.Capacity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="tags" title="Tipos de actividad">
            <h1>Tipos de actividad</h1>
            <Table responsive striped bordered size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{tag.Name}</td>
                    <td>{tag.Comments}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="activities" title="Actividades">
            <h1>Actividades</h1>
            <Table responsive striped bordered size="sm">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Profesor</th>
                  <th>Materia</th>
                  <th>Tipo Actividad</th>
                  <th>Estudiantes</th>
                  <th>Duración</th>
                  <th>Grupo de actividad</th>
                  <th>Duración total</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr>
                    <td>{activity.Id}</td>
                    <td>{activity.Teacher}</td>
                    <td>{activity.Subject}</td>
                    <td>{activity.ActivityTag}</td>
                    <td>{activity.Students}</td>
                    <td>{activity.Duration}</td>
                    <td>{activity.ActivityGroupId}</td>
                    <td>{activity.TotalDuration}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          <Tab eventKey="restrictions" title="Restricciones">
            <h1>Restricciones</h1>
            <hr />
            <h2>Receso</h2>
            <Table size="sm" responsive bordered striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Día</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {breakContraints.map((bc, index) => (
                  <tr>
                    <td>{index}</td>
                    <td>{bc.Day}</td>
                    <td>{bc.Hour}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <hr />
            <h2>Horarios no disponible de profesores</h2>
            <Table size="sm" responsive bordered striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Profesor</th>
                  <th>Día</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {teacherNotAvailable.map((tna, index) => (
                  <tr>
                    <td>{index}</td>
                    <td>{tna.Teacher}</td>
                    <td>{tna.Day}</td>
                    <td>{tna.Hour}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <hr />
            <h2>Actividad horario preferido </h2>
            <Table size="sm" responsive bordered striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Actividad</th>
                  <th>Día</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {activityPreferredHour.map((aph, index) => (
                  <tr>
                    <td>{index}</td>
                    <td>{aph.Activity_Id}</td>
                    <td>{aph.Preferred_Day}</td>
                    <td>{aph.Preferred_Hour}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Nombre de la planificación</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
          />
          <InputGroup.Append>
            <Button onClick={handleSave}>Guardar</Button>
          </InputGroup.Append>
        </InputGroup>
      </Modal.Footer>
    </Modal>
  );
};
