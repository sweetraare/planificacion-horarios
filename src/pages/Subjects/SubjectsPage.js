import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faFileExcel,
  faPencilAlt,
  faPlus,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../components/DataTable";
import { textFilter } from "react-bootstrap-table2-filter";
import SubjectsFormModal from "./components/SubjectsFormModal";
import { AuthContext } from "../../App";
import { toArray } from "lodash";
import { newErrorToast } from "../../utils/toasts";
import {
  getSubjects,
  listenSubjects,
} from "../../services/firebase/operations/subjects";
import SubjectsExcelModal from "./components/SubjectsExcelModal";

export default () => {
  const { plan } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [action, setAction] = useState("");
  const [selectedSubject, setSelectedSubject] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        return await getSubjects(plan ? plan : " ");
      } catch (errror) {
        return errror;
      }
    }

    fetchData()
      .then((subjects) => {
        if (subjects.exists()) {
          setData(toArray(subjects.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenSubjectsChange();
  }, []);

  const handleAddItem = () => {
    setAction("ADD");
    setShowFormModal(true);
  };

  const handleChangeActiveItem = () => {
    console.log("activate");
  };

  const handleEdit = (subject) => {
    setAction("EDIT");
    setSelectedSubject(subject);
    setShowFormModal(true);
  };

  const handleCancel = () => {
    setShowFormModal(false);
  };

  const handleCancelExcel = () => {
    setShowExcelModal(false);
  };

  const listenSubjectsChange = () => {
    listenSubjects(plan ? plan : " ", (subjects) => {
      if (subjects.exists()) {
        setData(toArray(subjects.val()));
      }
    });
  };

  return (
    <AdminLayout>
      <h1>Materias</h1>
      {plan ? (
        <>
          {" "}
          <Row className="my-3">
            <Col>
              <Button variant="primary" onClick={handleAddItem}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Agregar materias
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
                  // {
                  //   text: "Restricciones lugar",
                  //   headerStyle: {
                  //     width: "30%",
                  //     textAlign: "center",
                  //     verticalAlign: "middle",
                  //   },
                  // },
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
                          {/* &nbsp; */}
                          {/* <Button */}
                          {/*   variant={ */}
                          {/*     row.active ? "outline-danger" : "outline-success" */}
                          {/*   } */}
                          {/*   className="btn-sm" */}
                          {/*   onClick={() => handleChangeActiveItem(row)} */}
                          {/* > */}
                          {/*   <FontAwesomeIcon */}
                          {/*     icon={row.active ? faTrashAlt : faCheck} */}
                          {/*   /> */}
                          {/*   &nbsp; */}
                          {/*   {row.active */}
                          {/*     ? "Activar actividades" */}
                          {/*     : "Desactivar actividades"} */}
                          {/* </Button> */}
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

      <SubjectsFormModal
        show={showFormModal}
        handleClose={handleCancel}
        subjects={data}
        action={action}
        subject={selectedSubject}
      />

      <SubjectsExcelModal
        show={showExcelModal}
        handleClose={handleCancelExcel}
      />
    </AdminLayout>
  );
};
