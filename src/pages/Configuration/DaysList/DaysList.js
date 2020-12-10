import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./DaysList.scss";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import {
  addDaysList,
  getDaysList,
  listenDaysList,
} from "../../../services/firebase/operations/daysList";
import uniq from "lodash/uniq";

export default () => {
  const [Number_of_Days, setNumber_of_Days] = useState(5);
  const [DaysList, setDaysList] = useState([
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const daysListFetched = await getDaysList();

        return {
          daysListFetched,
        };
      } catch (error) {
        return error;
      }
    };

    fetchData()
      .then((data) => {
        const { daysListFetched } = data;

        if (daysListFetched.exists()) {
          setNumber_of_Days(daysListFetched.val().Number_of_Days);
          setDaysList(daysListFetched.val().Days_List);
        }
      })
      .catch((error) => newErrorToast(`Error: ${error.message}`));

    //real time update
    listenDaysListChange();
  }, []);

  const listenDaysListChange = () => {
    listenDaysList((daysList) => {
      if (daysList.exists()) {
        setNumber_of_Days(daysList.val().Number_of_Days);
        setDaysList(daysList.val().Days_List);
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (DaysList.length !== Number_of_Days) {
      const DaysListCopy = [...DaysList];

      if (
        DaysListCopy.slice(0, Number_of_Days).some((day) => day.length === 0) ||
        DaysListCopy.slice(0, Number_of_Days).length < Number_of_Days
      ) {
        newErrorToast(
          `ERROR: existe algún día que no está lleno. Por favor revisar`
        );
      } else {
        if (uniq(DaysListCopy).length !== DaysListCopy.length) {
          newErrorToast(`ERROR, existen días con el mismo nombre`);
          return;
        }
        try {
          await addDaysList({
            Number_of_Days,
            Days_List: DaysListCopy.slice(0, Number_of_Days),
          });
          newSuccessToast(`Información ingresada con éxito`);
        } catch (error) {
          newErrorToast(`ERROR: ${error.message}`);
        }
      }
    } else {
      if (DaysList.some((day) => day.length === 0)) {
        newErrorToast(
          `ERROR: existe algún día que no está lleno. Por favor revisar`
        );
      } else {
        try {
          await addDaysList({
            Number_of_Days,
            Days_List: DaysList,
          });
          newSuccessToast(`Información ingresada con éxito`);
        } catch (error) {
          newErrorToast(`ERROR: ${error.message}`);
        }
      }
    }
  };

  const createTableHeader = () => {
    const response = [];

    for (let i = 0; i < Number_of_Days; i++) {
      response.push(<th className="table-column">Día {i + 1}</th>);
    }
    return response;
  };

  const createTableBody = () => {
    const response = [];

    for (let i = 0; i < Number_of_Days; i++) {
      response.push(
        <td>
          <Form.Control
            className="table-column"
            name="title_en"
            type="text"
            value={DaysList[i] ? DaysList[i] : ""}
            onChange={(event) => handleChangeDay(event.target.value, i)}
          />
        </td>
      );
    }
    return response;
  };

  const handleChangeDay = (value, index) => {
    const DaysListCopy = [...DaysList];

    DaysListCopy[index] = value;

    setDaysList(DaysListCopy);
  };

  return (
    <Card>
      <Card.Title>Días de la semana</Card.Title>
      <Card.Body className="pt-0">
        <Form onSubmit={handleSubmit}>
          <div className="notification-form">
            {/*Nombre Form Group*/}
            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Días de trabajo semanales:{" "}
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  name="title_en"
                  type="number"
                  min={1}
                  max={35}
                  value={Number_of_Days}
                  required
                  onChange={(event) => setNumber_of_Days(event.target.value)}
                />
              </Col>
            </Form.Group>
            {/*Comentario Form Group*/}
            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Días:{" "}
              </Form.Label>
              <Col sm={9}>
                <Table bordered responsive>
                  <thead>
                    <tr>{createTableHeader()}</tr>
                  </thead>
                  <tbody>
                    <tr>{createTableBody()}</tr>
                  </tbody>
                </Table>
              </Col>
            </Form.Group>
          </div>
          <div className="pt-3">
            <Button type="submit" variant="primary" className="float-right">
              Guardar&nbsp;
              <FontAwesomeIcon icon={faSave} />
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};
