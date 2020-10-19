import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faCheck,
  faFileExcel,
  faPencilAlt,
  faPlus,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../components/DataTable";
import { numberFilter, textFilter } from "react-bootstrap-table2-filter";
import TeachersFormModal from "./components/TeachersFormModal";
import { AuthContext } from "../../App";
import { toArray } from "lodash";
import { newErrorToast } from "../../utils/toasts";
import {
  getSubjects,
  listenSubjects,
} from "../../services/firebase/operations/subjects";
import TeachersExcelModal from "./components/TeachersExcelModal";
import QualifiedSubjectsModal from "./components/QualifiedSubjectsModal";
import {
  getTeachers,
  listenTeachers,
} from "../../services/firebase/operations/teachers";

export default () => {
  const { plan } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showQualifiedModal, setShowQualifiedModal] = useState(false);
  const [action, setAction] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const teachersFetched = await getTeachers(plan ? plan : " ");
        const subjectsFetched = await getSubjects(plan ? plan : " ");

        return {
          teachersFetched,
          subjectsFetched,
        };
      } catch (error) {
        return error;
      }
    }

    fetchData()
      .then((data) => {
        const { teachersFetched, subjectsFetched } = data;

        if (teachersFetched.exists()) {
          setData(toArray(teachersFetched.val()));
        }

        if (subjectsFetched.exists()) {
          setSubjects(toArray(subjectsFetched.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenTeachersChange();
    listenSubjectsChange();
  }, []);

  const handleAddItem = () => {
    setAction("ADD");
    setShowFormModal(true);
  };

  const handleChangeActiveItem = () => {
    console.log("activate");
  };

  const handleEdit = (teacher) => {
    setAction("EDIT");
    setSelectedTeacher(teacher);
    setShowFormModal(true);
  };

  const handleCancel = () => {
    setShowFormModal(false);
  };

  const handleCancelExcel = () => {
    setShowExcelModal(false);
  };

  const handleCancelQualified = () => {
    setShowQualifiedModal(false);
  };

  const handleSubjects = (teacher) => {
    setShowQualifiedModal(true);
    setSelectedTeacher(teacher);
  };

  const listenTeachersChange = () => {
    listenTeachers(plan ? plan : " ", (teachers) => {
      if (teachers.exists()) {
        setData(toArray(teachers.val()));
      }
    });
  };

  const listenSubjectsChange = () => {
    listenSubjects(plan ? plan : " ", (subjects) => {
      if (subjects.exists()) {
        setSubjects(toArray(subjects.val()));
      }
    });
  };

  return (
    <AdminLayout>
      <h1>Profesores</h1>
      {plan ? (
        <>
          {" "}
          <Row className="my-3">
            <Col>
              <Button variant="primary" onClick={handleAddItem}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Agregar profesores
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowExcelModal(true)}
              >
                <FontAwesomeIcon icon={faFileExcel} />
                &nbsp;Importar desde Excel
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
                    text: "Nombre",
                    sort: true,
                    dataField: "Name",
                    filter: textFilter({ placeholder: "Buscar" }),
                    headerStyle: {
                      width: "30%",
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Horas Objetivo",
                    sort: true,
                    dataField: "TargetNumberOfHours",
                    filter: numberFilter({ placeholder: "Buscar" }),
                    headerStyle: {
                      width: "30%",
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Comentario",
                    dataField: "Comments",
                    filter: textFilter({ placeholder: "Buscar" }),
                    headerStyle: {
                      width: "30%",
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Restricciones lugar",
                    headerStyle: {
                      width: "30%",
                      textAlign: "center",
                      verticalAlign: "middle",
                    },
                  },
                  {
                    text: "Acciones",
                    dataField: "",
                    formatter: (cell, row) => {
                      return (
                        <>
                          <Button
                            variant="outline-secondary"
                            className="btn-sm"
                            onClick={() => handleEdit(row)}
                          >
                            <FontAwesomeIcon icon={faPencilAlt} />
                            &nbsp; Editar
                          </Button>
                          <Button
                            variant="outline-secondary"
                            className="btn-sm"
                            onClick={() => handleSubjects(row)}
                          >
                            <FontAwesomeIcon icon={faBook} />
                            &nbsp; Materias
                          </Button>
                          &nbsp;
                          <Button
                            variant={
                              row.active ? "outline-danger" : "outline-success"
                            }
                            className="btn-sm"
                            onClick={() => handleChangeActiveItem(row)}
                          >
                            <FontAwesomeIcon
                              icon={row.active ? faTrashAlt : faCheck}
                            />
                            &nbsp;
                            {row.active
                              ? "Activar actividades"
                              : "Desactivar actividades"}
                          </Button>
                        </>
                      );
                    },
                    align: "center",
                    headerStyle: {
                      width: "15%",
                      textAlign: "center",
                      verticalAlign: "middle",
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

      <TeachersFormModal
        show={showFormModal}
        handleClose={handleCancel}
        teachers={data}
        action={action}
        teacher={selectedTeacher}
      />

      <TeachersExcelModal
        show={showExcelModal}
        handleClose={handleCancelExcel}
      />

      <QualifiedSubjectsModal
        show={showQualifiedModal}
        handleClose={handleCancelQualified}
        teacher={selectedTeacher}
        subjects={subjects}
      />
    </AdminLayout>
  );
};
