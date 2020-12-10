import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./HoursList.scss";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import {
  addHoursList,
  getHoursList,
  listenHoursList,
} from "../../../services/firebase/operations/hoursList";
import uniq from "lodash/uniq";

export default () => {
  const [Number_of_Hours, setNumber_of_Hours] = useState(8);
  const [HoursList, setHoursList] = useState([
    "7 am",
    "8 am",
    "9 am",
    "10 am",
    "11 am",
    "12 am",
    "13 am",
    "14 am",
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hoursListFetched = await getHoursList();

        return {
          hoursListFetched,
        };
      } catch (error) {
        return error;
      }
    };

    fetchData()
      .then((data) => {
        const { hoursListFetched } = data;

        if (hoursListFetched.exists()) {
          setNumber_of_Hours(hoursListFetched.val().Number_of_Hours);
          setHoursList(hoursListFetched.val().Hours_List);
        }
      })
      .catch((error) => newErrorToast(`Error: ${error.message}`));

    //real time update
    listenHoursListChange();
  }, []);

  const listenHoursListChange = () => {
    listenHoursList((hoursList) => {
      if (hoursList.exists()) {
        setNumber_of_Hours(hoursList.val().Number_of_Hours);
        setHoursList(hoursList.val().Hours_List);
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (HoursList.length !== Number_of_Hours) {
      const HoursListCopy = [...HoursList];

      if (
        HoursListCopy.slice(0, Number_of_Hours).some(
          (hour) => hour.length === 0
        ) ||
        HoursListCopy.slice(0, Number_of_Hours).length < Number_of_Hours
      ) {
        newErrorToast(
          `ERROR: existe alguna hora que no está llena. Por favor revisar`
        );
      } else {
        if (uniq(HoursListCopy).length !== HoursListCopy.length) {
          newErrorToast(`Existe un nombre de horario repetido`);
          return;
        }
        try {
          await addHoursList({
            Number_of_Hours,
            Hours_List: HoursListCopy.slice(0, Number_of_Hours),
          });
          newSuccessToast(`Información ingresada con éxito`);
        } catch (error) {
          newErrorToast(`ERROR: ${error.message}`);
        }
      }
    } else {
      if (HoursList.some((hour) => hour.length === 0)) {
        newErrorToast(
          `ERROR: existe alguna hora que no está llena. Por favor revisar`
        );
      } else {
        try {
          await addHoursList({
            Number_of_Hours,
            Hours_List: HoursList,
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

    for (let i = 0; i < Number_of_Hours; i++) {
      response.push(<th className="table-column">Hora {i + 1}</th>);
    }
    return response;
  };

  const createTableBody = () => {
    const response = [];

    for (let i = 0; i < Number_of_Hours; i++) {
      response.push(
        <td>
          <Form.Control
            className="table-column"
            name="title_en"
            type="text"
            value={HoursList[i] ? HoursList[i] : ""}
            onChange={(event) => handleChangeDay(event.target.value, i)}
          />
        </td>
      );
    }
    return response;
  };

  const handleChangeDay = (value, index) => {
    const HoursListCopy = [...HoursList];

    HoursListCopy[index] = value;

    setHoursList(HoursListCopy);
  };

  return (
    <Card>
      <Card.Title>Horas del día</Card.Title>
      <Card.Body className="pt-0">
        <Form onSubmit={handleSubmit}>
          <div className="notification-form">
            {/*Nombre Form Group*/}
            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Periodos Diarios:{" "}
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  name="title_en"
                  type="number"
                  min={1}
                  max={72}
                  value={Number_of_Hours}
                  required
                  onChange={(event) => setNumber_of_Hours(event.target.value)}
                />
              </Col>
            </Form.Group>
            {/*Comentario Form Group*/}
            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Horas:{" "}
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
