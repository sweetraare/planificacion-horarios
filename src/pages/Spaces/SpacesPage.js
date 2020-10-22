import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { AuthContext } from "../../App";
import {
  getSpaces,
  listenSpaces,
} from "../../services/firebase/operations/spaces";
import toArray from "lodash/toArray";
import { newErrorToast } from "../../utils/toasts";
import { Button, Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../components/DataTable";
import { textFilter } from "react-bootstrap-table2-filter";
import SpacesFormModal from "./components/SpacesFormModal";
import SpacesRoomModal from "./components/SpacesRoomModal";

export default () => {
  const { plan } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showRoomModal, setRoomModal] = useState(false);
  const [buildings, setBuildings] = useState([]);

  const handleAddRoom = () => {
    setRoomModal(true);
  };

  const handleAddItem = () => {
    setShowFormModal(true);
  };

  const handleChangeActiveItem = () => {
    console.log("activate");
  };

  const handleCancel = () => {
    setShowFormModal(false);
    setRoomModal(false);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const roomsFetched = await getSpaces(plan ? plan : " ", "rooms");
        const buildingsFetched = await getSpaces(plan ? plan : " ", "building");
        return { roomsFetched, buildingsFetched };
      } catch (errror) {
        return errror;
      }
    }

    fetchData()
      .then((data) => {
        const { roomsFetched, buildingsFetched } = data;
        if (buildingsFetched.exists()) {
          setBuildings(toArray(buildingsFetched.val()));
        }
        if (roomsFetched.exists()) {
          setData(toArray(roomsFetched.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenSpacesChange("rooms", setData);
    listenSpacesChange("building", setBuildings);
  }, []);

  const listenSpacesChange = (type, set) => {
    listenSpaces(plan ? plan : " ", type, (space) => {
      if (space.exists()) {
        set(toArray(space.val()));
      }
    });
  };

  return (
    <AdminLayout>
      <h1>Espacios</h1>
      {plan ? (
        <>
          {" "}
          <Row className="my-3">
            <Col>
              <Button variant="primary" onClick={handleAddItem}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Agregar Edificios
              </Button>
              <Button variant="primary" onClick={handleAddRoom}>
                <FontAwesomeIcon icon={faPlus} />
                &nbsp;Agregar Aulas
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
                    text: "Edificio",
                    sort: true,
                    dataField: "Building",
                    filter: textFilter({ placeholder: "Buscar" }),
                    formatter: (cell) => {
                      const buildingFound = buildings.find(
                        (building) => building.slug === cell
                      );
                      return buildingFound ? buildingFound.Name : "---";
                    },
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
                    text: "Capacidad ",
                    dataField: "Capacity",
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
      <SpacesFormModal show={showFormModal} handleClose={handleCancel} />
      <SpacesRoomModal
        show={showRoomModal}
        handleClose={handleCancel}
        buildings={buildings}
      />
    </AdminLayout>
  );
};
