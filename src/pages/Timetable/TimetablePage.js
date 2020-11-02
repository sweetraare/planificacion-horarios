import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { Button, Col, Row, Table } from "react-bootstrap";
import { AuthContext } from "../../App";
import { toArray } from "lodash";
import { orderBy } from "lodash";
import { newErrorToast } from "../../utils/toasts";
import { getSubjects } from "../../services/firebase/operations/subjects";
import { getTeachers } from "../../services/firebase/operations/teachers";
import { getTags } from "../../services/firebase/operations/tags";
import { getStudents } from "../../services/firebase/operations/students";
import { getActivities } from "../../services/firebase/operations/activities";
import { getSpaces } from "../../services/firebase/operations/spaces";
import { getDaysList } from "../../services/firebase/operations/daysList";
import { getHoursList } from "../../services/firebase/operations/hoursList";
import { getTimeContraints } from "../../services/firebase/operations/timeConstraints";
import {
  getInstitution,
  getComments,
} from "../../services/firebase/operations/institution";
import axios from "axios";
import csv from "csvtojson";
import DataTable from "../../components/DataTable";
import { textFilter } from "react-bootstrap-table2-filter";

export default () => {
  const { plan } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [students, setStudents] = useState([]);
  const [days, setDays] = useState({});
  const [hours, setHours] = useState({});
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [institution, setInstitution] = useState({});
  const [comments, setComments] = useState({});
  const [timeConstraints, setTimeConstraints] = useState([]);
  const [XML, setXML] = useState("");
  const [timeTable, setTimeTable] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [typeOfTimeTable, setTypeOfTimeTable] = useState("");
  const [activeGenerateXML, setActiveGenerateXML] = useState(false);

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
        const daysFetched = await getDaysList(plan ? plan : " ");
        const hoursFetched = await getHoursList(plan ? plan : " ");
        const institutionFetched = await getInstitution();
        const commentsFetched = await getComments();
        const timeConstraintsFetched = await getTimeContraints(
          plan ? plan : " "
        );

        return {
          subjectsFetched,
          teachersFetched,
          tagsFetched,
          studentsFetched,
          activitiesFetched,
          roomsFetched,
          buildingsFetched,
          daysFetched,
          hoursFetched,
          institutionFetched,
          commentsFetched,
          timeConstraintsFetched,
        };
      } catch (error) {
        return error;
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
          roomsFetched,
          buildingsFetched,
          daysFetched,
          hoursFetched,
          institutionFetched,
          commentsFetched,
          timeConstraintsFetched,
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

        setSubjects(toArray(subjectsFetched.val()));
        setTeachers(toArray(teachersFetched.val()));
        setStudents(toArray(studentsFetched.val()));
        setTags(toArray(tagsFetched.val()));
        setBuildings(toArray(buildingsFetched.val()));
        setRooms(toArray(roomsFetched.val()));
        setDays(daysFetched.val());
        setHours(hoursFetched.val());
        setInstitution(institutionFetched.val());
        setComments(commentsFetched.val());
        setTimeConstraints(toArray(timeConstraintsFetched.val()));
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));
  }, []);

  useEffect(() => {
    if (
      subjects.length &&
      teachers.length &&
      students.length &&
      tags.length &&
      buildings.length &&
      rooms.length &&
      timeConstraints.length
    ) {
      setActiveGenerateXML(true);
    }
  }, [subjects, teachers, students, tags, buildings, rooms, timeConstraints]);

  const generateXML = async () => {
    const newXML = `<?xml version="1.0" encoding="UTF-8"?>

<fet version="5.46.1">
<Institution_Name>${institution}</Institution_Name>

<Comments>${comments}</Comments>

${generateDaysListXML()}

${generateHoursListXML()}

${generateSubjectListXML()}

${generateTagsListXML()}

${generateTeachersListXML()}

${generateStudentsListXML()}

${generateActivitiesListXML()}

${generateBuildingsListXML()}

${generateRoomsListXML()}

  <Time_Constraints_List>
<ConstraintBasicCompulsoryTime>
<Weight_Percentage>100</Weight_Percentage>
<Active>true</Active>
<Comments></Comments>
</ConstraintBasicCompulsoryTime>

${generateTimeConstraintsXML()}
</Time_Constraints_List>
  
  <Space_Constraints_List>
<ConstraintBasicCompulsorySpace>
<Weight_Percentage>100</Weight_Percentage>
<Active>true</Active>
<Comments></Comments>
</ConstraintBasicCompulsorySpace>
</Space_Constraints_List>


</fet>`;

    const file = new Blob([newXML], {
      type: "text/plain;charset=utf-8",
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        " http://64.227.56.89:8080/api/upload",
        formData
      );

      csv({
        noheader: false,
      })
        .fromString(response.data)
        .then((csv) => {
          console.log("csv:", csv);
          console.log("data:", data);
          const newTimeTable = csv.map((c) => {
            const activityFound = data.find(
              (activity) => activity.id === +c["Activity Id"]
            );
            const subjectFound = subjects.find(
              (subject) => subject.Name === c["Subject"]
            );
            const hourIndex = hours.Hours_List.findIndex((h) => h === c.Hour);
            return { ...c, activityFound, subjectFound, hourIndex };
          });

          setTimeTable(newTimeTable);
          setShowButtons(true);
        })
        .catch((e) => console.log(e));

      setXML(response.data);
    } catch (error) {
      return error;
    }
  };

  const generateDaysListXML = () => {
    return `
<Days_List>
<Number_of_Days>${days.Number_of_Days}</Number_of_Days>
${
  days.Days_List &&
  days.Days_List.map((day) => `<Day><Name>${day}</Name></Day>`).join("")
}
</Days_List>
`;
  };

  const generateHoursListXML = () => {
    return `
<Hours_List>
<Number_of_Hours>${hours.Number_of_Hours}</Number_of_Hours>
${
  hours.Hours_List &&
  hours.Hours_List.map((hour) => `<Hour><Name>${hour}</Name></Hour>`).join("")
}
</Hours_List>
`;
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
    return `
<Students_List>
${students
  .map(
    (student) =>
      `<Year>
            <Name>${student.Name}</Name>
            <Number_of_Students>${student.NumberOfStudents}</Number_of_Students>
            <Comments>${student.Comments}</Comments>
            ${
              student.groups
                ? student.groups.map(
                    (g) => `
            <Group>
<Name>${g.Name}</Name>
<Number_of_Students>${g.NumberOfStudents}</Number_of_Students>
<Comments>${g.Comments}</Comments>

${
  g.subgroups
    ? g.subgroups.map(
        (sg) => `
<Subgroup>
<Name>${sg.Name}</Name>
<Number_of_Students>${sg.NumberOfStudents}</Number_of_Students>
<Comments>${sg.Comments}</Comments>
</Subgroup>

`
      )
    : ""
}
</Group>

            `
                  )
                : ""
            }
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

  const generateBuildingsListXML = () => {
    return `
<Buildings_List>
${buildings
  .map(
    (building) =>
      `<Building><Name>${building.Name}</Name><Comments>${building.Comments}</Comments></Building>`
  )
  .join("")}
</Buildings_List>
`;
  };

  const generateRoomsListXML = () => {
    return `
<Rooms_List>
${rooms
  .map(
    (room) =>
      `<Room>
            <Name>${room.Name}
            </Name>
            <Building>${
              buildings.find((b) => b.slug === room.Building).Name
            }</Building>
            <Capacity>${room.Capacity}</Capacity>
            <Virtual>false</Virtual>
            <Comments>${room.Comments}
            </Comments>
      </Room>`
  )
  .join("")}
</Rooms_List>
`;
  };

  const generateTimeConstraintsXML = () => {
    return `
    ${timeConstraints.map((tc) => tc)}
    `;
  };

  const showAllTimeTable = () => {
    setTypeOfTimeTable("ALL");
  };

  const generateTimeTable = () => {
    switch (typeOfTimeTable) {
      case "ALL":
        console.log("timeTableALL:", timeTable);

        const allTimeTable = data.map((activity) => {
          const activityTimeTables = [...timeTable].filter(
            (t) => +t["Activity Id"] === activity.id
          );

          const firstTimeTable = orderBy(
            activityTimeTables,
            ["hourIndex"],
            ["desc"]
          )[0];

          return { ...activity, firstTimeTable };
        });

        console.log("alltime table", allTimeTable);

        return (
          <Table>
            <thead>
              <tr>
                <th>Profesor</th>
                <th>Materia</th>
                <th>Estudiantes</th>
                {days.Days_List && days.Days_List.map((day) => <th>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {allTimeTable.map((tt) => (
                <tr>
                  <td>{tt.Teacher}</td>
                  <td>{tt.Subject}</td>
                  <td>{tt.Students}</td>
                  {days.Days_List &&
                    days.Days_List.map((day, index) => {
                      return (
                        <td>
                          {day === tt.firstTimeTable.Day
                            ? `${tt.firstTimeTable.Hour} \n ${
                                hours.Hours_List[index + tt.Duration]
                              } `
                            : ""}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </Table>
        );

      default:
        return null;
    }
  };
  return (
    <AdminLayout>
      <h1>Horario</h1>
      {plan ? (
        <>
          <Button onClick={generateXML} disabled={!activeGenerateXML}>
            Generar Horarios{" "}
          </Button>
          {showButtons ? (
            <>
              <Button> Horario Profesores</Button>
              <Button onClick={showAllTimeTable}> Todos los horarios </Button>
            </>
          ) : null}
          {generateTimeTable()}
        </>
      ) : (
        <h1>
          Necesitas seleccionar un plan en la pantalla principal para continuar.
        </h1>
      )}
    </AdminLayout>
  );
};
