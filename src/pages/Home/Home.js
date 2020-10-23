import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";

import "./Home.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import {
  addPlan,
  getPlans,
  listenPlans,
} from "../../services/firebase/operations/plans";
import { newErrorToast, newSuccessToast } from "../../utils/toasts";
import { toArray } from "lodash";
import { AuthContext } from "../../App";

export default () => {
  const { plan, setPlan } = useContext(AuthContext);

  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState("");
  const [showNewPlan, setSHowNewPlan] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        return await getPlans();
      } catch (errror) {
        return errror;
      }
    }

    fetchData()
      .then((data) => {
        if (data.exists()) {
          setPlans(toArray(data.val()));
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenPlansListChange();
  }, []);

  const handleSaveNewPlan = async () => {
    try {
      await addPlan(newPlan);
      newSuccessToast(`Plan agregado con éxito`);
      setPlan(newPlan);
      setNewPlan("");
      setSHowNewPlan(false);
    } catch (error) {
      newErrorToast(`ERROR: ${error.message}`);
    }
  };

  const listenPlansListChange = () => {
    listenPlans((data) => {
      if (data.exists()) {
        setPlans(toArray(data.val()));
      }
    });
  };

  return (
    <AdminLayout>
      <h1>Bienvenido al sistema</h1>

      <div className="plan-container">
        <div>
          <h4>Por favor seleccione un plan</h4>
          <Form.Control
            as="select"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option disabled value="">
              Seleccione un plan
            </option>
            {plans.map((plan, index) => (
              <option value={plan} key={index}>
                {plan}
              </option>
            ))}
          </Form.Control>
        </div>
        <Button onClick={() => setSHowNewPlan(true)}> Crear nuevo Plan</Button>
      </div>
      {showNewPlan && (
        <Form.Group as={Row} className="w-50">
          <Form.Label column sm={4}>
            Nombre del nuevo plan
          </Form.Label>
          <Col sm={4}>
            <Form.Control
              type="text"
              value={newPlan}
              required
              onChange={(event) => setNewPlan(event.target.value)}
            />
          </Col>
          <Col sm={4}>
            <Button variant="primary" onClick={handleSaveNewPlan}>
              Guardar
            </Button>
          </Col>
        </Form.Group>
      )}
    </AdminLayout>
  );
};
