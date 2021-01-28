import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import "./Home.css";
import { InputGroup, Button, Col, Form, Row } from "react-bootstrap";
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
import ImportDataModal from "./components/ImportDataModal";
import xml2js from "xml2js";

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
  const [fileToImport, setFileToImport] = useState(null);
  const [FETData, setFETData] = useState(null);
  const [showImportModal, setSHowImportModal] = useState(false);

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

  const handleClose = () => {
    setSHowImportModal(false);
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

  const handleFile = () => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        xml2js.parseString(data, (error, result) => {
          if (error) {
            newErrorToast(`Ha existido un error en la importación: ${error}`);
            console.log(error);
            setFETData(null);
          } else {
            if (result.fet) {
              console.log(result.fet);
              const FETObject = {
                Activities: result.fet.Activities_List
                  ? result.fet.Activities_List[0].Activity.map((activity) => ({
                      ActivityGroupId: +activity.Activity_Group_Id[0],
                      ActivityTag: activity.Activity_Tag[0],
                      Duration: activity.Duration[0],
                      Id: +activity.Id[0],
                      Students: activity.Students,
                      Subject: activity.Subject[0],
                      Teacher: activity.Teacher[0],
                      TotalDuration: +activity.Total_Duration[0],
                    }))
                  : [],
                Tags: result.fet.Activity_Tags_List
                  ? result.fet.Activity_Tags_List[0].Activity_Tag.map(
                      (tag) => ({
                        Name: tag.Name[0],
                        Comments: tag.Comments[0],
                      })
                    )
                  : [],
                Buildings: result.fet.Buildings_List
                  ? result.fet.Buildings_List[0].Building.map((building) => ({
                      Name: building.Name[0],
                      Comments: building.Comments[0],
                    }))
                  : [],
                Rooms: result.fet.Rooms_List
                  ? result.fet.Rooms_List[0].Room.map((room) => ({
                      Name: room.Name[0],
                      Capacity: +room.Capacity[0],
                      Building: room.Building[0],
                      Comments: room.Comments[0],
                    }))
                  : [],
                Subjects: result.fet.Subjects_List
                  ? result.fet.Subjects_List[0].Subject.map((subject) => ({
                      Name: subject.Name[0],
                      Comments: subject.Comments[0],
                    }))
                  : [],
                Teachers: result.fet.Teachers_List
                  ? result.fet.Teachers_List[0].Teacher.map((teacher) => ({
                      Name: teacher.Name[0],
                      Comments: teacher.Comments[0],
                      TargetNumberOfHours: +teacher.Target_Number_of_Hours[0],
                      QualifiedSubjects:
                        teacher.Qualified_Subjects[0].Qualified_Subject,
                    }))
                  : [],
                Students: result.fet.Students_List
                  ? result.fet.Students_List[0].Year
                  : [],
                BreakConstraints: result.fet.Time_Constraints_List
                  ? result.fet.Time_Constraints_List[0].ConstraintBreakTimes[0]
                      .Break_Time
                  : [],
                ConstraintTeacherNotAvailableTimes: result.fet
                  .Time_Constraints_List[0].ConstraintTeacherNotAvailableTimes
                  ? result.fet.Time_Constraints_List[0]
                      .ConstraintTeacherNotAvailableTimes
                  : [],
                ConstraintActivityPreferredStartingTime: result.fet
                  .Time_Constraints_List[0]
                  .ConstraintActivityPreferredStartingTime
                  ? result.fet.Time_Constraints_List[0]
                      .ConstraintActivityPreferredStartingTime
                  : [],
              };
              console.log("mi objecto:", FETObject);
              setFETData(FETObject);
              setSHowImportModal(true);
            }
          }
        });
      };
      reader.readAsText(fileToImport);
    } catch (e) {
      console.log(e);
      newErrorToast(`Asegúrese de haber seleccionado un archivo`);
    }
  };

  const handleChangeFile = (e) => {
    setFileToImport(e.target.files[0]);
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
      <InputGroup>
        <input
          type="file"
          className="form-control"
          id="file"
          // accept={SheetJSFT}
          onChange={handleChangeFile}
        />
        <InputGroup.Append>
          <Button onClick={handleFile}>Importar Archivo</Button>
        </InputGroup.Append>
      </InputGroup>
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
      <ImportDataModal
        FETData={FETData}
        show={showImportModal}
        handleClose={handleClose}
        plans={plans}
      />
    </AdminLayout>
  );
};
