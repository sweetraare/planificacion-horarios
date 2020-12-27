import React, { useContext, useEffect, useState } from "react";
import { Table, Button, Modal, Tabs, Tab, Card } from "react-bootstrap";
import { generateUniqueKey } from "../../../utils/generateUniqueKey";
import { newErrorToast } from "../../../utils/toasts";
import { AuthContext } from "../../../App";

import "./ImportDataModal.css";

export default ({ show, handleClose, FETData }) => {
  const { plan } = useContext(AuthContext);

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [tags, setTags] = useState([]);
  const [activities, setActivities] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);

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
            <ul>
              {subjects.map((subject) => (
                <li>{JSON.stringify(subject)}</li>
              ))}
            </ul>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};
