import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { AuthContext } from "../../App";
import { getTags, listenTags } from "../../services/firebase/operations/tags";
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
import TagsFormModal from "./components/TagsFormModal";

export default () => {
  const { plan } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState({});
  const [action, setAction] = useState("");

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
        return await getTags(plan ? plan : " ");
      } catch (errror) {
        return errror;
      }
    }

    fetchData()
      .then((data) => {
        if (data.exists()) {
          setData(toArray(data.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenTagsChange();
  }, []);

  const listenTagsChange = () => {
    listenTags(plan ? plan : " ", (tags) => {
      if (tags.exists()) {
        setData(toArray(tags.val()));
      }
    });
  };

  return (
    <AdminLayout>
      <h1>Códigos</h1>
      {plan ? (
        <>
          {" "}
          <Row className="my-3">
            <Col>
              <Button variant="primary" onClick={handleAddItem}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Agregar Códigos
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
                    text: "Acciones",
                    dataField: "",
                    formatter: (cell, row) => {
                      return (
                        <>
                          <Button
                            onClick={() => handleEditItem(row)}
                            className="btn-sm"
                            variant="outline-secondary"
                          >
                            <FontAwesomeIcon icon={faPencilAlt} /> &nbsp; Editar
                          </Button>
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
      <TagsFormModal
        show={showFormModal}
        handleClose={handleCancel}
        action={action}
        tag={selectedTag}
      />
    </AdminLayout>
  );
};
