import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { AuthContext } from "../../App";
import {
  getActivities,
  listenActivities,
  removeActivity,
} from "../../services/firebase/operations/activities";
import toArray from "lodash/toArray";
import { newErrorToast } from "../../utils/toasts";
import { Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faPlus,
  faTrashAlt,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../components/DataTable";
import { textFilter } from "react-bootstrap-table2-filter";
import ActivitiesFormModal from "./components/ActivitiesFormModal";
import { getStudents } from "../../services/firebase/operations/students";
import { getSubjects } from "../../services/firebase/operations/subjects";
import { getTags } from "../../services/firebase/operations/tags";
import { getTeachers } from "../../services/firebase/operations/teachers";

export default () => {
  const { plan } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState({});
  const [action, setAction] = useState("");
  const [students, setStudents] = useState([]);
  const [tags, setTags] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const handleAddItem = () => {
    setShowFormModal(true);
    setAction("ADD");
    setSelectedTag({});
  };

  const handleEditItem = (item) => {
    setSelectedTag(item);
    setAction("EDIT");
    setShowFormModal(true);
  };
  const handleChangeActiveItem = () => {
    console.log("activate");
  };

  const handleCancel = () => {
    setShowFormModal(false);
    setSelectedTag({});
    setAction("");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const activitiesFetched = await getActivities(plan ? plan : " ");
        const studentsFetched = await getStudents(plan ? plan : " ");
        const tagsFetched = await getTags(plan ? plan : " ");
        const teachersFetched = await getTeachers(plan ? plan : " ");
        const subjectsFetched = await getSubjects(plan ? plan : " ");
        return {
          activitiesFetched,
          studentsFetched,
          tagsFetched,
          teachersFetched,
          subjectsFetched,
        };
      } catch (error) {
        return error;
      }
    }

    fetchData()
      .then((data) => {
        const {
          activitiesFetched,
          studentsFetched,
          tagsFetched,
          teachersFetched,
          subjectsFetched,
        } = data;
        if (activitiesFetched.exists()) {
          setData(
            toArray(activitiesFetched.val()).map((activity) => {
              const allStudents = toArray(studentsFetched.val()).reduce(
                (acc, s) => {
                  if (s.groups) {
                    acc = acc.concat(s.groups);
                    s.groups.forEach((g) => {
                      if (g.subgroups) {
                        acc = acc.concat(g.subgroups);
                      }
                    });
                  }

                  acc = acc.concat(s);

                  return acc;
                },
                []
              );
              const studentsList = allStudents.filter((as) =>
                activity.Students.includes(as.slug)
              );
              return {
                ...activity,
                Students: studentsList,
                Tag: tagsFetched.val()[activity.Tag],
                Teacher: teachersFetched.val()[activity.Teacher],
                Subject: subjectsFetched.val()[activity.Subject],
              };
            })
          );
        }
        setStudents(toArray(studentsFetched.val()));
        setTags(toArray(tagsFetched.val()));
        setTeachers(toArray(teachersFetched.val()));
        setSubjects(toArray(subjectsFetched.val()));
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));
    listenActivitiesChange();
  }, []);

  const listenActivitiesChange = async () => {
    const studentsFetched = await getStudents(plan ? plan : " ");
    const tagsFetched = await getTags(plan ? plan : " ");
    const teachersFetched = await getTeachers(plan ? plan : " ");
    const subjectsFetched = await getSubjects(plan ? plan : " ");

    listenActivities(plan ? plan : " ", (data) => {
      if (data.exists()) {
        setData(
          toArray(data.val()).map((activity) => {
            const allStudents = toArray(studentsFetched.val()).reduce(
              (acc, s) => {
                if (s.groups) {
                  acc = acc.concat(s.groups);
                  s.groups.forEach((g) => {
                    if (g.subgroups) {
                      acc = acc.concat(g.subgroups);
                    }
                  });
                }

                acc = acc.concat(s);

                return acc;
              },
              []
            );
            const studentsList = allStudents.filter((as) =>
              activity.Students.includes(as.slug)
            );
            return {
              ...activity,
              Students: studentsList,
              Tag: tagsFetched.val()[activity.Tag],
              Teacher: teachersFetched.val()[activity.Teacher],
              Subject: subjectsFetched.val()[activity.Subject],
            };
          })
        );
      }
    });
  };

  const handleDeleteActivity = async (activity) => {
    try {
      await removeActivity(plan ? plan : " ", activity.slug);
    } catch (error) {
      console.log(error);
      newErrorToast(`ERROR: ${error.message}`);
    }
  };

  return (
    <AdminLayout>
      <h1>Actividades</h1>
      {plan ? (
        <>
          {" "}
          <Row className="my-3">
            <Col>
              <Button variant="primary" onClick={handleAddItem}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Agregar Actividades
              </Button>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <DataTable
                keyField="slug"
                data={data}
                columns={[
                  {
                    text: "Id",
                    sort: true,
                    dataField: "id",
                    headerStyle: {
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Profesor",
                    sort: true,
                    dataField: "Teacher",
                    filter: textFilter({ placeholder: "Buscar" }),
                    formatter: (cell) => cell && cell.Name,
                    headerStyle: {
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Materia",
                    dataField: "Subject",
                    sort: true,
                    formatter: (cell) => cell && cell.Name,
                    align: "center",
                    headerStyle: {
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Estudiantes",
                    sort: true,
                    dataField: "Students",
                    formatter: (cell) => cell.map((s) => s.Name).join(","),
                    align: "center",
                    headerStyle: {
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Tipo de Actividad",
                    sort: true,
                    dataField: "Tag",
                    formatter: (cell) => cell && cell.Name,
                    align: "center",
                    headerStyle: {
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Duración",
                    dataField: "Duration",
                    align: "center",
                    headerStyle: {
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Grupo de actividades",
                    dataField: "ActivityGroup",
                    align: "center",
                    headerStyle: {
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Duración total",
                    dataField: "TotalDuration",
                    align: "center",
                    headerStyle: {
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Acciones",
                    dataField: "",
                    formatter: (cell, row) => {
                      return (
                        <Button
                          className="btn-sm"
                          variant="outline-danger"
                          onClick={() => handleDeleteActivity(row)}
                        >
                          Eliminar
                        </Button>
                      );
                    },
                  },
                ]}
              />
            </Col>
          </Row>
        </>
      ) : (
        <h1>
          Necesitas seleccionar un plan en la pantalla principal para continuar.
        </h1>
      )}
      <ActivitiesFormModal
        show={showFormModal}
        handleClose={handleCancel}
        action={action}
        tag={selectedTag}
      />
    </AdminLayout>
  );
};
