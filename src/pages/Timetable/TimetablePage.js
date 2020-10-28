import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { Button, Col, Row } from "react-bootstrap";
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

export default () => {
  const { plan } = useContext(AuthContext);
  console.log(plan);

  const [data, setData] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSujects] = useState([]);
  const [tags, setTags] = useState([]);
  const [students, setStudents] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [XML, setXML] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const subjectsFetched = await getSubjects(plan ? plan : " ");
        const teachersFetched = await getTeachers(plan ? plan : " ");
        const tagsFetched = await getTags(plan ? plan : " ");
        const studentsFetched = await getStudents(plan ? plan : " ");
        const activitiesFetched = await getActivities(plan ? plan : " ");
        const roomsFetched = await getSpaces(plan ? plan : " ", "rooms");
        const buildingsFetched = await getSpaces(plan ? plan : " ", "building");
        return {
          subjectsFetched,
          teachersFetched,
          tagsFetched,
          studentsFetched,
          activitiesFetched,
          roomsFetched,
          buildingsFetched,
        };
      } catch (errror) {
        return errror;
      }
    }

    fetchData()
      .then((data) => {
        console.log("data", data);
        const {
          subjectsFetched,
          teachersFetched,
          tagsFetched,
          studentsFetched,
          activitiesFetched,
          buildingsFetched,
          roomsFetched,
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

        setSujects(toArray(subjectsFetched.val()));
        setTeachers(toArray(teachersFetched.val()));
        setStudents(toArray(studentsFetched.val()));
        setTags(toArray(tagsFetched.val()));
        setBuildings(toArray(buildingsFetched.val()));
        setRooms(toArray(roomsFetched.val()));
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));
  }, []);

  const generateXML = () => {
    const newXML = `
<?xml version="1.0" encoding="UTF-8"?>

<fet version="5.46.1">
<Institution_Name>Escuela Politécnica Nacional</Institution_Name>

<Comments>Facultad de Ingeniería de Sistemas</Comments>

<Days_List>
<Number_of_Days>6</Number_of_Days>
<Day>
	<Name>Lunes</Name>
</Day>
<Day>
	<Name>Martes</Name>
</Day>
<Day>
	<Name>Miércoles</Name>
</Day>
<Day>
	<Name>Jueves</Name>
</Day>
<Day>
	<Name>Viernes</Name>
</Day>
<Day>
	<Name>Sábado</Name>
</Day>
</Days_List>

<Hours_List>
<Number_of_Hours>15</Number_of_Hours>
<Hour>
	<Name>07:00-08:00</Name>
</Hour>
<Hour>
	<Name>08:00-09:00</Name>
</Hour>
<Hour>
	<Name>09:00-10:00</Name>
</Hour>
<Hour>
	<Name>10:00-11:00</Name>
</Hour>
<Hour>
	<Name>11:00-12:00</Name>
</Hour>
<Hour>
	<Name>12:00-13:00</Name>
</Hour>
<Hour>
	<Name>13:00-14:00</Name>
</Hour>
<Hour>
	<Name>14:00-15:00</Name>
</Hour>
<Hour>
	<Name>15:00-16:00</Name>
</Hour>
<Hour>
	<Name>16:00-17:00</Name>
</Hour>
<Hour>
	<Name>17:00-18:00</Name>
</Hour>
<Hour>
	<Name>18:00-19:00</Name>
</Hour>
<Hour>
	<Name>19:00-20:00</Name>
</Hour>
<Hour>
	<Name>20:00-21:00</Name>
</Hour>
<Hour>
	<Name>21:00-22:00</Name>
</Hour>
</Hours_List>
${generateSubjectListXML()}

${generateTagsListXML()}

${generateTeachersListXML()}

${generateStudentsListXML()}

${generateActivitiesListXML()}


  <Time_Constraints_List>
<ConstraintBasicCompulsoryTime>
<Weight_Percentage>100</Weight_Percentage>
<Active>true</Active>
<Comments></Comments>
</ConstraintBasicCompulsoryTime>
</Time_Constraints_List>
  
  <Space_Constraints_List>
<ConstraintBasicCompulsorySpace>
<Weight_Percentage>100</Weight_Percentage>
<Active>true</Active>
<Comments></Comments>
</ConstraintBasicCompulsorySpace>
</Space_Constraints_List>


</fet>
    `;
    setXML(newXML);
  };

  const generateSubjectListXML = () => {
    return `
<Subjects_List>
${subjects
  .map(
    (subject) =>
      `<Subject> <Name>${subject.Name}</Name><Comments>${subject.Comments}</Comments></Subject>`
  )
  .join("")}
</Subjects_List>
`;
  };

  const generateTagsListXML = () => {
    return `
<Activity_Tags_List>
${tags
  .map(
    (tag) =>
      `<Activity_Tag><Name>${tag.Name}</Name><Printable>true</Printable><Comments>${tag.Comments}</Comments></Activity_Tag>`
  )
  .join("")}
</Activity_Tags_List>
`;
  };

  const generateTeachersListXML = () => {
    return `
    <Teachers_List>
    ${teachers
      .map(
        (teacher) => `<Teacher>
      <Name>${teacher.Name}</Name>
    <Target_Number_of_Hours>${
      teacher.TargetNumberOfHours
    }</Target_Number_of_Hours>
    <Qualified_Subjects>
    
    ${
      teacher.QualifiedSubjects
        ? teacher.QualifiedSubjects.map(
            (qs) =>
              `<Qualified_Subject>${
                subjects.find((subject) => subject.slug === qs).Name
              }</Qualified_Subject>`
          ).join("")
        : ""
    }
    
    
    </Qualified_Subjects>
    <Comments>${teacher.Comments}</Comments>
    </Teacher>`
      )
      .join("")}
    </Teachers_List>
    `;
  };

  const generateStudentsListXML = () => {
    //TODO add groups and subgroups
    return `
<Students_List>
${students
  .map(
    (student) =>
      `<Year>
            <Name>${student.Name}</Name>
            <Number_of_Students>${student.NumberOfStudents}</Number_of_Students>
            <Comments>${student.Comments}</Comments>
      </Year>`
  )
  .join("")}
</Students_List>
`;
  };

  const generateActivitiesListXML = () => {
    //TODO add number of students
    return `
<Activities_List>
${data
  .map(
    (activity) =>
      `<Activity>
          <Teacher>${activity.Teacher}</Teacher>
          <Subject>${activity.Subject}</Subject>
          <Activity_Tag>${activity.Tag}</Activity_Tag>
          <Students>${activity.Students}</Students>
          <Duration>${activity.Duration}</Duration>
          <Total_Duration>${activity.TotalDuration}</Total_Duration>
          <Id>${activity.id}</Id>
          <Activity_Group_Id>${activity.ActivityGroup}</Activity_Group_Id>
          <Number_Of_Students>20</Number_Of_Students> 
          <Active>true</Active>
          <Comments> </Comments>
</Activity>`
  )
  .join("")}
</Activities_List>
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
