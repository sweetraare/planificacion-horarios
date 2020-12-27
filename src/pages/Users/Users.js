import React, { useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { Button, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckCircle,
  faPencilAlt,
  faTimesCircle,
  faTrashAlt,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import toArray from "lodash/toArray";
import { newErrorToast, newSuccessToast } from "../../utils/toasts";
import {
  addUser,
  getUsers,
  listenUsers,
} from "../../services/firebase/operations/users";
import DataTable from "../../components/DataTable";
import {
  Comparator,
  dateFilter,
  textFilter,
} from "react-bootstrap-table2-filter";
import UsersFormModal from "./components/UsersFormModal";
import { CreateUser, ResetPassword } from "../../services/firebase/auth";

export default () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState({});
  const [action, setAction] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getUsers();
        if (users.exists()) {
          return users.val();
        }
      } catch (error) {
        return error;
      }
    };

    fetchData()
      .then((data) => {
        if (data) {
          setData(toArray(data));
        }
      })
      .catch((error) => newErrorToast(`Error: ${error.message}`));

    //real time update
    listenPlansChange();
  }, []);

  const handleAddItem = () => {
    setSelectedItem({});
    setAction("ADD");
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setAction("EDIT");
  };

  const handleChangeActiveItem = async (item) => {
    await addUser(item.uid, {
      ...item,
      active: !item.active,
    });
  };

  const listenPlansChange = () => {
    listenUsers((users) => {
      setData(
        toArray(users.val()).filter(
          (user) => user.role === "admin" || user.role === "operator"
        )
      );
    });
  };

  const saveItem = async (item) => {
    try {
      switch (action) {
        case "ADD":
          const randomString = Math.random().toString(36).substring(7);
          const user = await CreateUser(item.email, randomString);

          if (user.code !== "auth/email-already-in-use") {
            ResetPassword(item.email)
              .then((a) =>
                newSuccessToast(
                  `Se ha enviado un correo electrónico a ${item.email}, por favor siga las instrucciones enviadas`
                )
              )
              .catch((e) => alert(e));
            await addUser(user.uid, { ...item, uid: user.uid });
            newSuccessToast(`Usuario agregado con éxito`);
          } else {
            newErrorToast("Correo electrónico ya ingresado");
          }

          break;
        case "EDIT":
          await addUser(selectedItem.uid, { ...setSelectedItem, ...item });
          newSuccessToast(`Usuario actualizado con  éxito`);
          break;
        default:
          return;
      }
      setAction("");
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
    }
  };
  const handleCancel = () => {
    setSelectedItem({});
    setAction("");
  };

  return (
    <AdminLayout>
      <h1>Administración de usuarios</h1>

      <Row className="my-3">
        <Col>
          <Button variant="primary" className="btn-sm" onClick={handleAddItem}>
            <FontAwesomeIcon icon={faUserPlus} />
            &nbsp;Agregar usuario
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
                dataField: "firstName",
                filter: textFilter({ placeholder: "Search" }),
                headerStyle: {
                  width: "10%",
                  textAlign: "center",
                  verticalAlign: "middle",
                },
              },
              {
                text: "Apellido",
                sort: true,
                dataField: "lastName",
                filter: textFilter({ placeholder: "Search" }),
                headerStyle: {
                  width: "10%",
                  textAlign: "center",
                  verticalAlign: "middle",
                },
              },
              {
                text: "Correo electrónico",
                sort: true,
                dataField: "email",
                filter: textFilter({ placeholder: "Search" }),
                headerStyle: {
                  width: "10%",
                  textAlign: "center",
                  verticalAlign: "middle",
                },
              },
              {
                text: "Rol",
                sort: true,
                dataField: "role",
                filter: textFilter({ placeholder: "Search" }),
                headerStyle: {
                  width: "10%",
                  textAlign: "center",
                  verticalAlign: "middle",
                },
              },
              {
                text: "Usuario activo",
                dataField: "active",
                sort: true,
                formatter: (cell) => (
                  <div className="text-center">
                    <FontAwesomeIcon
                      icon={cell ? faCheckCircle : faTimesCircle}
                    />
                  </div>
                ),
                headerStyle: {
                  width: "5%",
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
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Editar usuario</Tooltip>}
                      >
                        <Button
                          variant="outline-secondary"
                          className="btn-sm"
                          onClick={() => handleEditItem(row)}
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </Button>
                      </OverlayTrigger>
                      &nbsp;
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {row.active
                              ? "Inhabilitar usuario"
                              : "Activar usuario"}
                          </Tooltip>
                        }
                      >
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
                        </Button>
                      </OverlayTrigger>
                    </>
                  );
                },
                align: "center",
                headerStyle: {
                  width: "8%",
                  textAlign: "center",
                  verticalAlign: "middle",
                },
              },
            ]}
          />
        </Col>
      </Row>

      <UsersFormModal
        show={action === "ADD" || action === "EDIT"}
        itemToEdit={selectedItem}
        handleClose={handleCancel}
        handleSaveItem={saveItem}
      />
    </AdminLayout>
  );
};
