import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import "./Home.css";
import { Button, Col, Form, Row } from "react-bootstrap";
import {
  addPlan,
  getPlans,
  listenPlans,
  getAllPlanData,
  setAllPlanData,
} from "../../services/firebase/operations/plans";
import { getDaysList } from "../../services/firebase/operations/daysList";
import { getHoursList } from "../../services/firebase/operations/hoursList";
import {
  getInstitution,
  getComments,
} from "../../services/firebase/operations/institution";
import { newErrorToast, newSuccessToast } from "../../utils/toasts";
import { toArray } from "lodash";
import { AuthContext } from "../../App";
import { generateXML } from "../../utils/generateFETFile";

export default () => {
  const { plan, setPlan } = useContext(AuthContext);

  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState("");
  const [showNewPlan, setSHowNewPlan] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [planData, setPlanData] = useState(null);
  //data to generate FET File
  const [institution, setInstitution] = useState("");
  const [comments, setComments] = useState("");
  const [DaysList, setDaysList] = useState({});
  const [HoursList, seetHoursList] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const PlansFetched = await getPlans();
        const InstitutionFetched = await getInstitution();
        const DaysListFetched = await getDaysList();
        const HoursListFetched = await getHoursList();
        const CommentsFetched = await getComments();
        return {
          PlansFetched,
          InstitutionFetched,
          DaysListFetched,
          HoursListFetched,
          CommentsFetched,
        };
      } catch (error) {
        return error;
      }
    }

    fetchData()
      .then((data) => {
        const {
          PlansFetched,
          InstitutionFetched,
          DaysListFetched,
          HoursListFetched,
          CommentsFetched,
        } = data;
        if (PlansFetched.exists()) {
          setPlans(toArray(PlansFetched.val()));
        }
        if (CommentsFetched.exists()) {
          setComments(CommentsFetched.val());
        }
        if (InstitutionFetched.exists()) {
          setInstitution(InstitutionFetched.val());
        }
        if (DaysListFetched.exists()) {
          setDaysList(DaysListFetched.val());
        }
        if (HoursListFetched.exists()) {
          seetHoursList(HoursListFetched.val());
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));

    listenPlansListChange();
  }, []);

  const handleSaveNewPlan = async () => {
    if (plans.find((p) => p.toUpperCase() === newPlan.toUpperCase())) {
      newErrorToast(`Plan: ${newPlan} ya existe`);
      return;
    }
    try {
      await addPlan(newPlan);
      newSuccessToast(`Plan agregado con éxito`);
      if (isDuplicate && planData) {
        await setAllPlanData(newPlan, planData);
        newSuccessToast(`Plan duplicado exitosamente`);
      }
      setPlan(newPlan);
      setNewPlan("");
      setSHowNewPlan(false);
      setIsDuplicate(false);
      setPlanData(null);
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

  useEffect(() => {
    async function fetchData() {
      try {
        return await getAllPlanData(plan ? plan : " ");
      } catch (error) {
        return error;
      }
    }

    fetchData()
      .then((data) => {
        if (data.exists()) {
          setPlanData(data.val());
        } else {
          setPlanData(null);
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));
  }, [plan]);

  const handleDuplicatePlan = () => {
    setSHowNewPlan(true);
    setIsDuplicate(true);
  };

  const handleExportPlan = () => {
    console.log(planData);
    const data = {
      institution: institution,
      comments: comments,
      days: DaysList,
      hours: HoursList,
      subjects: toArray(planData.subjects),
      tags: toArray(planData.tags),
      teachers: toArray(planData.teachers),
      students: toArray(planData.students),
      activities: toArray(planData.activities),
      buildings: toArray(planData.spaces.building),
      rooms: toArray(planData.spaces.rooms),
      timeConstraints: toArray(planData.timeContraints),
      breakConstraints: planData.breakContraints,
      timeConstraintsInput: toArray(planData.timeContraintsInput),
      spaceConstraints: toArray(planData.spaceConstraints),
    };
    console.log("datas", data);
    const XMLResponse = generateXML(data);
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(XMLResponse)
    );
    element.setAttribute("download", `${plan}.fet`);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
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
        <Button onClick={handleDuplicatePlan}> Duplicar Plan</Button>
        <Button disabled={!planData} onClick={handleExportPlan}>
          Exportar Plan a FET
        </Button>
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
