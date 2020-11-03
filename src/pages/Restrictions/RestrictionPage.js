import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../App";
import AdminLayout from "../../HOC/AdminLayout";
import {
  Row,
  Col,
  Button,
  Accordion,
  Card,
  Table,
  Form,
} from "react-bootstrap";
import { getHoursList } from "../../services/firebase/operations/hoursList";
import { getDaysList } from "../../services/firebase/operations/daysList";
import { getTimeContraints } from "../../services/firebase/operations/timeConstraints";
import toArray from "lodash/toArray";

export default () => {
  const { plan } = useContext(AuthContext);

  const [typeOfRestriction, setTypeOfRestriction] = useState("");
  const [hours, setHours] = useState({});
  const [days, setDays] = useState({});
  const [breakValues, setBreakValues] = useState([]);
  const [timeContraints, setTimeConstraints] = useState([]);
  const [restrictionWeigth, setRestrictionWeigth] = useState(100);

  useEffect(() => {
    async function fetchData() {
      try {
        const hoursFetched = await getHoursList();
        const daysFetched = await getDaysList();
        const timeConstraintsFetched = await getTimeContraints();
        return {
          hoursFetched,
          daysFetched,
          timeConstraintsFetched,
        };
      } catch (error) {
        return error;
      }
    }
    fetchData().then((data) => {
      const { hoursFetched, daysFetched, timeConstraintsFetched } = data;
      if (hoursFetched.exists()) {
        setHours(hoursFetched.val());
      }
      if (daysFetched.exists()) {
        setDays(daysFetched.val());
      }
      if (timeConstraintsFetched.exists()) {
        setTimeConstraints(toArray(timeConstraintsFetched.val()));
      }
    });
  }, []);

  useEffect(() => {
    const itemIndex = timeContraints.findIndex((tc) =>
      tc.includes("ConstraintBreakTimes")
    );
    if (itemIndex !== -1) {
      console.log(timeContraints[itemIndex]);
    }
  }, [timeContraints]);

  const handleChangeBreak = (day, hour) => {
    const itemIndex = breakValues.findIndex(
      (bv) => bv.day === day && bv.hour === hour
    );
    if (itemIndex !== -1) {
      const breakValuesCopy = [...breakValues];
      breakValuesCopy.splice(itemIndex, 1);
      setBreakValues(breakValuesCopy);
    } else {
      setBreakValues(breakValues.concat({ day, hour }));
    }
  };

  const handleSaveBreak = () => {};

  const renderInterface = () => {
    switch (typeOfRestriction) {
      case "time":
        return (
          <>
            <Accordion defaultActiveKey="0">
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="0">
                  Break
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    <Row>
                      <Col>
                        <Form.Group as={Row}>
                          <Form.Label column sm={4}>
                            Peso (Necesario 100%)
                          </Form.Label>
                          <Col xs={8}>
                            <Form.Control
                              type="number"
                              min={0}
                              max={100}
                              value={restrictionWeigth}
                              onChange={(e) =>
                                setRestrictionWeigth(+e.target.value)
                              }
                            />
                          </Col>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Button onClick={handleSaveBreak}>Guardar</Button>
                      </Col>
                    </Row>
                    <Table bordered striped>
                      <thead>
                        <tr>
                          <th></th>
                          {days.Days_List &&
                            days.Days_List.map((day) => <th>{day}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {hours.Hours_List &&
                          hours.Hours_List.map((hour) => (
                            <tr>
                              <td>{hour}</td>
                              {days.Days_List &&
                                days.Days_List.map((day) => (
                                  <td
                                    onClick={() => handleChangeBreak(day, hour)}
                                  >
                                    {breakValues.some(
                                      (bv) => bv.day === day && bv.hour === hour
                                    ) && "-x-"}
                                  </td>
                                ))}
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="1">
                  Click me!
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>Hello! I'm another body</Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </>
        );

      case "space":
        return <h2> Restricciones de Lugar! </h2>;

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <h1>Restricciones</h1>
      {plan ? (
        <>
          <Button onClick={() => setTypeOfRestriction("space")}>
            Restricciones de Lugar
          </Button>
          <Button onClick={() => setTypeOfRestriction("time")}>
            Restricciones de tiempo
          </Button>
          <>{renderInterface()}</>
        </>
      ) : (
        <h1>
          Necesitas seleccionar un plan en la pantalla principal para continuar.
        </h1>
      )}
    </AdminLayout>
  );
};
