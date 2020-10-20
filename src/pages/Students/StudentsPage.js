import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { AuthContext } from "../../App";
import {
  getStudents,
  listenStudents,
} from "../../services/firebase/operations/students";
import toArray from "lodash/toArray";
import { newErrorToast } from "../../utils/toasts";
import { Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFileExcel,
  faPencilAlt,
  faPlus,
  faTrashAlt,
  faObjectGroup,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../components/DataTable";
import { textFilter } from "react-bootstrap-table2-filter";
import StudentsFormModal from "./components/StudentsFormModal";
import {
  getSubjects,
  listenSubjects,
} from "../../services/firebase/operations/subjects";
export default () => {
  const { plan } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [action, setAction] = useState("");
  const [selectedStudent, setSelectedStudent] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        return await getStudents(plan ? plan : " ");
      } catch (errror) {
        return errror;
      }
    }

    fetchData()
      .then((students) => {
        if (students.exists()) {
          setData(toArray(students.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenStudentsChange();
  }, []);

  const handleAddItem = () => {
    setAction("ADD");
    setShowFormModal(true);
  };

  const handleChangeActiveItem = () => {
    console.log("activate");
  };

  const handleEdit = (student) => {
    setAction("EDIT");
    setSelectedStudent(student);
    setShowFormModal(true);
  };

  const handleCancel = () => {
    setShowFormModal(false);
  };

  const handleCancelExcel = () => {
    setShowExcelModal(false);
  };

  const listenStudentsChange = () => {
    listenStudents(plan ? plan : " ", (students) => {
      if (students.exists()) {
        setData(toArray(students.val()));
      }
    });
  };

  return (
    <AdminLayout>
      <h1>Estudiantes</h1>
      {plan ? (
        <>
          {" "}
          <Row className="my-3">
            <Col>
              <Button variant="primary" onClick={handleAddItem}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Agregar Estudiantes
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
                    text: "Número de estudiantes ",
                    headerStyle: {
                      width: "15%",
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
                          &nbsp;
                          <Button
                            variant="outline-secondary"
                            className="btn-sm"
                            onClick={() => handleEdit(row)}
                          >
                            <FontAwesomeIcon icon={faObjectGroup} />
                            &nbsp; Grupos
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
      <StudentsFormModal
        show={showFormModal}
        handleClose={handleCancel}
        action={action}
        student={selectedStudent}
      />
    </AdminLayout>
  );
};
