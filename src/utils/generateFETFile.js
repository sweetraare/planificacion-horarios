import toArray from "lodash/toArray";

export const generateXML = (data) => {
  const {
    institution,
    comments,
    days,
    hours,
    subjects,
    tags,
    teachers,
    students,
    activities,
    buildings,
    rooms,
    timeConstraints,
    breakConstraints,
    timeConstraintsInput,
    spaceConstraints,
  } = data;
  console.log(data);
  const activitiesMapped = activities.map((activity) => {
    return {
      ...activity,
      Teacher: teachers.find((t) => t.slug === activity.Teacher).Name,
      Subject: subjects.find((s) => s.slug === activity.Subject).Name,
      Tag: tags.find((t) => t.slug === activity.Tag).Name,
      Students: students
        .filter((s) => activity.Students.includes(s.slug))
        .map((s) => s.Name),
    };
  });
  const newXML = `<?xml version="1.0" encoding="UTF-8"?>

<fet version="5.46.1">
<Institution_Name>${institution}</Institution_Name>

<Comments>${comments}</Comments>

${generateDaysListXML(days)}

${generateHoursListXML(hours)}

${generateSubjectListXML(subjects)}

${generateTagsListXML(tags)}

${generateTeachersListXML(teachers, subjects)}

${generateStudentsListXML(students)}

${generateActivitiesListXML(activitiesMapped, students)}

${generateBuildingsListXML(buildings)}

${generateRoomsListXML(rooms, buildings)}

  <Time_Constraints_List>
<ConstraintBasicCompulsoryTime>
<Weight_Percentage>100</Weight_Percentage>
<Active>true</Active>
<Comments></Comments>
</ConstraintBasicCompulsoryTime>

${generateTimeConstraintsXML(timeConstraints)}
${generateBreakConstraintXML(breakConstraints)}
${generateTimeConstraintsInputXML(
  timeConstraintsInput,
  activitiesMapped,
  teachers
)}
</Time_Constraints_List>
  
  <Space_Constraints_List>
<ConstraintBasicCompulsorySpace>
<Weight_Percentage>100</Weight_Percentage>
<Active>true</Active>
<Comments></Comments>
</ConstraintBasicCompulsorySpace>
${generateSpaceConstraintsXML(spaceConstraints, subjects, rooms, tags)}
</Space_Constraints_List>


</fet>`;
  return newXML;
};

const generateDaysListXML = (days) => {
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

const generateHoursListXML = (hours) => {
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

const generateSubjectListXML = (subjects) => {
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

const generateTagsListXML = (tags) => {
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

const generateTeachersListXML = (teachers, subjects) => {
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

const generateStudentsListXML = (students) => {
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

const generateActivitiesListXML = (activities, students) => {
  return `
<Activities_List>
${activities
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

const generateBuildingsListXML = (buildings) => {
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

const generateRoomsListXML = (rooms, buildings) => {
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

const generateTimeConstraintsXML = (timeConstraints) => {
  return `
    ${timeConstraints.map((tc) => tc)}
    `;
};

const generateTimeConstraintsInputXML = (
  timeConstraintsInput,
  activities,
  teachers
) => {
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
        const activityFound = activities.find(
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

const generateBreakConstraintXML = (breakConstraints) => {
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

const generateSpaceConstraintsXML = (
  spaceConstraints,
  subjects,
  rooms,
  tags
) => {
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
