import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../../HOC/AdminLayout";
import { Form, Button, Col, Row, Table } from "react-bootstrap";
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
import { getSpaceContraints } from "../../services/firebase/operations/spaceConstraint";
import { getTimeContraintsInput } from "../../services/firebase/operations/timeConstraintsInput";
import { getBreakContraints } from "../../services/firebase/operations/breakConstraint";
import {
  getInstitution,
  getComments,
} from "../../services/firebase/operations/institution";
import {
  addTimetable,
  getTimetable,
  listenTimetable,
} from "../../services/firebase/operations/timetable";
import axios from "axios";
import csv from "csvtojson";
import XLSX from "xlsx";

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
  const [timeTable, setTimeTable] = useState([]);
  const [showButtons, setShowButtons] = useState(false);
  const [typeOfTimeTable, setTypeOfTimeTable] = useState("");
  const [activeGenerateXML, setActiveGenerateXML] = useState(false);
  const [showSaveExcel, setShowSaveExcel] = useState(false);
  const [breakConstraints, setBreakConstraints] = useState([]);
  const [spaceConstraints, setSpaceConstraints] = useState([]);
  const [timeConstraintsInput, setTimeConstraintsInput] = useState([]);
  const [error, setError] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

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
        const spaceConstraintsFetched = await getSpaceContraints(
          plan ? plan : ""
        );
        const timeConstraintsInputFetched = await getTimeContraintsInput(
          plan ? plan : ""
        );
        const breakConstraintFetched = await getBreakContraints(
          plan ? plan : " "
        );
        const timeConstraintsFetched = await getTimeContraints(
          plan ? plan : " "
        );
        const timetableFetched = await getTimetable(plan ? plan : " ");

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
          breakConstraintFetched,
          spaceConstraintsFetched,
          timeConstraintsInputFetched,
          timetableFetched,
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
          breakConstraintFetched,
          spaceConstraintsFetched,
          timeConstraintsInputFetched,
          timetableFetched,
        } = data;

        setData(
          toArray(activitiesFetched.val()).map((act) => {
            const allStudents = toArray(studentsFetched.val()).reduce(
              (acc, s) => {
                if (s.groups) {
                  acc = acc.concat(s.groups);
                  s.groups.forEach((g) => {
                    if (g.subgroups) {
                      acc = acc.concat(g.subgroups);
                    }
                  });
                }

                acc = acc.concat(s);

                return acc;
              },
              []
            );
            const studentsList = allStudents.filter((as) =>
              act.Students.includes(as.slug)
            );

            return {
              ...act,
              Teacher: teachersFetched.val()[act.Teacher].Name,
              Subject: subjectsFetched.val()[act.Subject].Name,
              Tag: tagsFetched.val()[act.Tag].Name,
              Students: studentsList,
            };
          })
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
        if (breakConstraintFetched.exists()) {
          setBreakConstraints(breakConstraintFetched.val());
        }
        if (spaceConstraintsFetched.exists()) {
          setSpaceConstraints(toArray(spaceConstraintsFetched.val()));
        }
        if (timeConstraintsInputFetched.exists()) {
          setTimeConstraintsInput(toArray(timeConstraintsInputFetched.val()));
        }
        if (timetableFetched.exists()) {
          setTimeTable(timetableFetched.val());
          setShowButtons(true);
        }
      })
      .catch((error) => newErrorToast(`ERROR: ${error.message}`));
    listenTimetableChange();
  }, []);

  useEffect(() => {
    if (
      subjects.length &&
      teachers.length &&
      students.length &&
      tags.length &&
      buildings.length &&
      rooms.length
    ) {
      setActiveGenerateXML(true);
    }
  }, [subjects, teachers, students, tags, buildings, rooms, timeConstraints]);

  const listenTimetableChange = () => {
    listenTimetable(plan ? plan : " ", (tt) => {
      if (tt.exists()) {
        setTimeTable(tt.val());
      }
    });
  };

  const generateXML = async () => {
    const newXML = `<?xml version="1.0" encoding="UTF-8"?>

<fet version="5.35.5">
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
${generateBreakConstraintXML()}
${generateTimeConstraintsInputXML()}
</Time_Constraints_List>
  
  <Space_Constraints_List>
<ConstraintBasicCompulsorySpace>
<Weight_Percentage>100</Weight_Percentage>
<Active>true</Active>
<Comments></Comments>
</ConstraintBasicCompulsorySpace>
${generateSpaceConstraintsXML()}
</Space_Constraints_List>


</fet>`;

    const file = new Blob([newXML], {
      type: "text/plain;charset=utf-8",
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://960186d510b9.ngrok.io/api/upload",
        formData
      );

      if (response.data.status === "error") {
        console.log("ERROR:", response.data.message);
        setError(response.data.message);
        return;
      }
      setError("");

      csv({
        noheader: false,
      })
        .fromString(response.data)
        .then((csv) => {
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
          addTimetable(plan ? plan : " ", newTimeTable).then();
          setShowButtons(true);
        })
        .catch((e) => console.log(e));
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
    return `
<Activities_List>
${data
  .map(
    (activity) =>
      `<Activity>
          <Teacher>${activity.Teacher}</Teacher>
          <Subject>${activity.Subject}</Subject>
          <Activity_Tag>${activity.Tag}</Activity_Tag>
${activity.Students.map((s) => {
  const studentFound = students.find((st) => st.slug === s);
  if (studentFound) {
    return `<Students>${studentFound.Name}</Students>`;
  }
  return "";
}).join("")}
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
            <Name>${room.Name}</Name>
            <Building>${
              buildings.find((b) => b.slug === room.Building).Name
            }</Building>
            <Capacity>${room.Capacity}</Capacity>
            <Virtual>false</Virtual>
            <Comments>${room.Comments}</Comments>
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

  const generateTimeConstraintsInputXML = () => {
    if (timeConstraintsInput.length) {
      const teachersConstraints = timeConstraintsInput.filter(
        (tc) => tc.restrictionType === "teacher-not-available"
      );
      const activitiesConstraints = timeConstraintsInput.filter(
        (tc) => tc.restrictionType === "activity-preferred-hour"
      );
      const constraintsPerTeacher = teachersConstraints.reduce((acc, tc) => {
        if (acc[tc.teacher]) {
          acc[tc.teacher] = {
            slug: tc.teacher,
            constraints: acc[tc.teacher].constraints.concat(tc),
          };
        } else {
          acc[tc.teacher] = { slug: tc.teacher, constraints: [tc] };
        }
        return acc;
      }, {});
      let response = "";
      response += activitiesConstraints
        .map((ac) => {
          const activityFound = data.find(
            (activity) => activity.slug === ac.activity
          );
          if (activityFound) {
            return `<ConstraintActivityPreferredStartingTime>
	<Weight_Percentage>100</Weight_Percentage>
	<Activity_Id>${activityFound.id}</Activity_Id>
	<Preferred_Day>${ac.day}</Preferred_Day>
	<Preferred_Hour>${ac.hour}</Preferred_Hour>
	<Permanently_Locked>false</Permanently_Locked>
	<Active>true</Active>
	<Comments></Comments>
  </ConstraintActivityPreferredStartingTime>`;
          }
          return "";
        })
        .join("");

      response += toArray(constraintsPerTeacher)
        .map((cpt) => {
          const teacherFound = teachers.find(
            (teacher) => teacher.slug === cpt.slug
          );
          if (teacherFound) {
            return `<ConstraintTeacherNotAvailableTimes>
	<Weight_Percentage>100</Weight_Percentage>
	<Teacher>${teacherFound.Name}</Teacher>
	<Number_of_Not_Available_Times>${
    cpt.constraints.length
  }</Number_of_Not_Available_Times>
${cpt.constraints
  .map(
    (constraint) => `
	<Not_Available_Time>
		<Day>${constraint.day}</Day>
    <Hour>${constraint.hour}</Hour>
	</Not_Available_Time>
	`
  )
  .join("")}
</ConstraintTeacherNotAvailableTimes>
`;
          }
          return "";
        })
        .join("");

      return response;
    }
    return "";
  };

  const generateBreakConstraintXML = () => {
    if (breakConstraints.length) {
      return `
<ConstraintBreakTimes>
	<Weight_Percentage>100</Weight_Percentage>
	<Number_of_Break_Times>${breakConstraints.length}</Number_of_Break_Times>
  ${breakConstraints.map(
    (bc) =>
      `<Break_Time><Day>${bc.day}</Day><Hour>${bc.hour}</Hour></Break_Time>`
  )}
</ConstraintBreakTimes>
    `;
    } else {
      return "";
    }
  };

  const generateSpaceConstraintsXML = () => {
    if (spaceConstraints.length) {
      return spaceConstraints
        .map((sc) => {
          switch (sc.restrictionType) {
            case "subject-room":
              const subjectFound = subjects.find(
                (subject) => subject.slug === sc.subject
              );
              const roomFound = rooms.find((room) => room.slug === sc.room);
              return `
<ConstraintSubjectPreferredRoom>
<Weight_Percentage>100</Weight_Percentage>
<Subject>${subjectFound.Name}</Subject>
<Room>${roomFound.Name}</Room>
<Active>true</Active>
<Comments></Comments>
</ConstraintSubjectPreferredRoom>
            `;
              break;
            case "tag-room":
              const tagFound = tags.find((tag) => tag.slug === sc.tag);
              const roomFound1 = rooms.find((room) => room.slug === sc.room);
              return `
<ConstraintActivityTagPreferredRoom>
<Weight_Percentage>100</Weight_Percentage>
<Activity_Tag>${tagFound.Name}</Activity_Tag>
<Room>${roomFound1.Name}</Room>
<Active>true</Active>
<Comments></Comments>
</ConstraintActivityTagPreferredRoom>
            `;
              break;
            case "subject-group":
              const subjectFound1 = subjects.find(
                (subject) => subject.slug === sc.subject
              );
              return `
<ConstraintSubjectPreferredRooms>
<Weight_Percentage>100</Weight_Percentage>
<Subject>${subjectFound1.Name}</Subject>
<Number_of_Preferred_Rooms>${
                sc.preferredRooms.length
              }</Number_of_Preferred_Rooms>
${sc.preferredRooms
  .map(
    (r) =>
      `<Preferred_Room>${
        rooms.find((room) => room.slug === r).Name
      }</Preferred_Room>`
  )
  .join("")}
<Active>true</Active>
<Comments></Comments>
</ConstraintSubjectPreferredRooms>
            `;
              break;
            case "tag-group":
              const tagFound1 = tags.find((tag) => tag.slug === sc.tag);
              return `
<ConstraintActivityTagPreferredRooms>
<Weight_Percentage>100</Weight_Percentage>
<Activity_Tag>${tagFound1.Name}</Activity_Tag>
<Number_of_Preferred_Rooms>${
                sc.preferredRooms.length
              }</Number_of_Preferred_Rooms>
${sc.preferredRooms
  .map(
    (r) =>
      `<Preferred_Room>${
        rooms.find((room) => room.slug === r).Name
      }</Preferred_Room>`
  )
  .join("")}
<Active>true</Active>
<Comments></Comments>
</ConstraintActivityTagPreferredRooms>
            `;
              break;
            default:
          }
        })
        .join("");
    }
    return "";
  };

  const showAllTimeTable = () => {
    setTypeOfTimeTable("ALL");
  };

  const showTeachersTimeTable = () => {
    setTypeOfTimeTable("TEACHERS");
  };

  const generateTimeTable = () => {
    if (error.length)
      return (
        <>
          <h2>Ha existido un problema</h2>
          <h4>A continuación se presenta el log generado por FET</h4>
          <p>{error}</p>
        </>
      );
    switch (typeOfTimeTable) {
      case "TEACHERS":
        const teachersTimeTable = data
          .map((activity) => {
            const activityTimeTables = [...timeTable].filter(
              (t) => +t["Activity Id"] === activity.id
            );

            const firstTimeTable = orderBy(
              activityTimeTables,
              ["hourIndex"],
              ["asc"]
            )[0];

            return { ...activity, firstTimeTable };
          })
          .filter((i) => i.Teacher === selectedTeacher);

        return (
          <>
            <div className="my-5">
              <Form.Group as={Row}>
                <Form.Label column sm={4}>
                  Seleccione un profesor
                </Form.Label>
                <Col sm={4}>
                  <Form.Control
                    as="select"
                    name="role"
                    value={selectedTeacher}
                    onChange={(event) => setSelectedTeacher(event.target.value)}
                  >
                    <option value="">Selecciona un profesor</option>
                    {orderBy(teachers, ["Name"], ["asc"]).map((teacher) => (
                      <option value={teacher.Name}>{teacher.Name}</option>
                    ))}
                  </Form.Control>
                </Col>
              </Form.Group>
            </div>
            <Table striped bordered responsive>
              <thead>
                <tr>
                  <th style={{ width: "20vw" }}>Profesor</th>
                  <th style={{ width: "20vw" }}>Materia</th>
                  <th style={{ width: "20vw" }}>Estudiantes</th>
                  <th style={{ width: "20vw" }}>Duración</th>
                  {days.Days_List &&
                    days.Days_List.map((day) => (
                      <th style={{ width: "20vw" }}>{day}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {teachersTimeTable.map((tt) => (
                  <tr>
                    <td>{tt.Teacher}</td>
                    <td>{tt.Subject}</td>
                    <td>{`${tt.Students.map((s) => s.Name).join(",")}`}</td>
                    <td>{tt.Duration}</td>
                    {days.Days_List &&
                      days.Days_List.map((day, index) => {
                        return (
                          <td>
                            {day === tt.firstTimeTable.Day ? (
                              <>
                                {" "}
                                <span>
                                  {" "}
                                  {tt.Duration == 1
                                    ? tt.firstTimeTable.Hour
                                    : tt.firstTimeTable.Hour.substring(
                                        0,
                                        tt.firstTimeTable.Hour.indexOf("-")
                                      )}
                                </span>
                                {tt.Duration > 1 ? (
                                  <span>
                                    {hours.Hours_List[
                                      tt.firstTimeTable.hourIndex +
                                        tt.Duration -
                                        1
                                    ].substring(
                                      hours.Hours_List[
                                        tt.firstTimeTable.hourIndex +
                                          tt.Duration -
                                          1
                                      ].indexOf("-")
                                    )}
                                  </span>
                                ) : (
                                  ""
                                )}
                                <div>
                                  {tt.firstTimeTable.Room &&
                                    `(${tt.firstTimeTable.Room})`}
                                </div>{" "}
                              </>
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        );

      case "ALL":
        const allTimeTable = data.map((activity) => {
          const activityTimeTables = [...timeTable].filter(
            (t) => +t["Activity Id"] === activity.id
          );

          const firstTimeTable = orderBy(
            activityTimeTables,
            ["hourIndex"],
            ["asc"]
          )[0];

          return { ...activity, firstTimeTable };
        });

        return (
          <Table striped bordered responsive>
            <thead>
              <tr>
                <th style={{ width: "20vw" }}>Profesor</th>
                <th style={{ width: "20vw" }}>Materia</th>
                <th style={{ width: "20vw" }}>Estudiantes</th>
                <th style={{ width: "20vw" }}>Duración</th>
                {days.Days_List &&
                  days.Days_List.map((day) => (
                    <th style={{ width: "20vw" }}>{day}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {allTimeTable.map((tt) => (
                <tr>
                  <td>{tt.Teacher}</td>
                  <td>{tt.Subject}</td>
                  <td>{`${tt.Students.map((s) => s.Name).join(",")}`}</td>
                  <td>{tt.Duration}</td>
                  {days.Days_List &&
                    days.Days_List.map((day, index) => {
                      return (
                        <td>
                          {day === tt.firstTimeTable.Day ? (
                            <>
                              {" "}
                              <span>
                                {" "}
                                {tt.Duration == 1
                                  ? tt.firstTimeTable.Hour
                                  : tt.firstTimeTable.Hour.substring(
                                      0,
                                      tt.firstTimeTable.Hour.indexOf("-")
                                    )}
                              </span>
                              {tt.Duration > 1 ? (
                                <span>
                                  {hours.Hours_List[
                                    tt.firstTimeTable.hourIndex +
                                      tt.Duration -
                                      1
                                  ].substring(
                                    hours.Hours_List[
                                      tt.firstTimeTable.hourIndex +
                                        tt.Duration -
                                        1
                                    ].indexOf("-")
                                  )}
                                </span>
                              ) : (
                                ""
                              )}
                              <div>
                                {tt.firstTimeTable.Room &&
                                  `(${tt.firstTimeTable.Room})`}
                              </div>{" "}
                            </>
                          ) : (
                            ""
                          )}
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

  const handleSaveToExcel = () => {
    const fileName = "horarios.xlsx";
    const dataSheet = [];
    const allTimeTable = data.map((activity) => {
      const activityTimeTables = [...timeTable].filter(
        (t) => +t["Activity Id"] === activity.id
      );

      const firstTimeTable = orderBy(
        activityTimeTables,
        ["hourIndex"],
        ["asc"]
      )[0];

      return { ...activity, firstTimeTable };
    });

    console.log(allTimeTable);

    allTimeTable.forEach((tt) => {
      let newRow = {};
      newRow["Profesor"] = tt.Teacher;
      newRow["Materia"] = tt.Subject;
      newRow["Estudiantes"] = tt.Students.map((s) => s.Name).join(",");
      newRow["Duración"] = tt.Duration;
      {
        days.Days_List &&
          days.Days_List.forEach((day, index) => {
            newRow[day] =
              day === tt.firstTimeTable.Day
                ? `${
                    tt.Duration === 1
                      ? tt.firstTimeTable.Hour
                      : tt.firstTimeTable.Hour.substring(
                          0,
                          tt.firstTimeTable.Hour.indexOf("-")
                        )
                  }${
                    tt.Duration > 1
                      ? hours.Hours_List[
                          tt.firstTimeTable.hourIndex + tt.Duration - 1
                        ].substring(
                          hours.Hours_List[
                            tt.firstTimeTable.hourIndex + tt.Duration - 1
                          ].indexOf("-")
                        )
                      : ""
                  } ${tt.firstTimeTable.Room && tt.firstTimeTable.Room}`
                : "";
          });
      }
      dataSheet.push(newRow);
    });
    const ws = XLSX.utils.json_to_sheet(dataSheet);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Horario");
    XLSX.writeFile(wb, fileName);
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
              <Button onClick={showTeachersTimeTable}>
                {" "}
                Horario Profesores
              </Button>
              <Button onClick={showAllTimeTable}> Todos los horarios </Button>
              <Button onClick={handleSaveToExcel}>Descargar Excel</Button>
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
