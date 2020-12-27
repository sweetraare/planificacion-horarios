import { databaseFirebase as db } from "../config";

export const addTimetable = (plan, timeTable) => {
  const timeTableRef = db.ref(`${plan}/timetable`);
  return timeTableRef.update({ ...timeTable });
};

export const getTimetable = (plan) => {
  const TimetableRef = db.ref(`${plan}/timetable`);
  return TimetableRef.once("value");
};

export const listenTimetable = (plan, callbackFunction) => {
  const TimetableRef = db.ref(`${plan}/timetable`);
  return TimetableRef.on("value", callbackFunction);
};
