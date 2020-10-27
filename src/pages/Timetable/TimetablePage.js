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
import { getTeachers } from "../../services/firebase/operations/teachers";
import { getTags } from "../../services/firebase/operations/tags";
import { getStudents } from "../../services/firebase/operations/students";
import { getActivities } from "../../services/firebase/operations/activities";
import { getSpaces } from "../../services/firebase/operations/spaces";
import SubjectsExcelModal from "./components/SubjectsExcelModal";

export default () => {
  const { plan } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSujects] = useState([]);
  const [tags, setTags] = useState([]);
  const [students, setStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [XML, setXML] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const subjectsFetched = await getSubjects(plan ? plan : " ");
        const teachersFetched = await getTeachers(plan ? plan : " ");
        const tagsFetched = await getTags(plan ? plan : " ");
        const studentsFetched = await getStudents(plan ? plan : " ");
        const activitiesFetched = await getActivities(plan ? plan : " ");
        const spacesFetched = await getSpaces(plan ? plan : " ");
        return {
          subjectsFetched,
          teachersFetched,
          tagsFetched,
          studentsFetched,
          activitiesFetched,
          spacesFetched,
        };
      } catch (errror) {
        return errror;
      }
    }

    fetchData()
      .then((data) => {
        const {
          subjectsFetched,
          teachersFetched,
          tagsFetched,
          studentsFetched,
          activitiesFetched,
          spacesFetched,
        } = data;

        setData(
          toArray(activitiesFetched.val()).map((act) => ({
            ...act,
            Teacher: teachersFetched.val()[act.Teacher].Name,
            Subject: subjectsFetched.val()[act.Subject].Name,
            Tag: tagsFetched.val()[act.Tag].Name,
            Students: studentsFetched.val()[act.Students].Name,
          }))
        );

        setSujects(toArray(subjectsFetched));
        setTeachers(toArray(teachersFetched));
        tagsFetched(toArray(tagsFetched));
        setStudents(toArray(studentsFetched));
        setSpaces(toArray(spacesFetched));
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));
  }, []);

  const generateXML = () => {
    const newXML = `
    `;
  };

  return (
    <AdminLayout>
      <h1>Horario</h1>
      {plan ? (
        <>
          <Button onClick={generateXML}>Generar XML </Button>
          <p>{XML}</p>
        </>
      ) : (
        <h1>
          Necesitas seleccionar un plan en la pantalla principal para continuar.
        </h1>
      )}
    </AdminLayout>
  );
};
