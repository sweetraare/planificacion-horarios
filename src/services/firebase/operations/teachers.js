import { databaseFirebase as db } from "../config";

export const addTeacher = (plan, slug, teacher) => {
  const TeachersRef = db.ref(`${plan}/teachers`);
  return TeachersRef.child(slug).update({ ...teacher });
};

export const removeAllTeachers = (plan) => {
  const TeachersRef = db.ref(`${plan}/teachers`);
  return TeachersRef.remove();
};

export const editTeacherProperty = (plan, slug, property, value) => {
  const TeachersRef = db.ref(`${plan}/teachers`);
  return TeachersRef.child(slug).child(property).update(value);
};

export const getTeachers = (plan) => {
  const TeachersRef = db.ref(`${plan}/teachers`);
  return TeachersRef.once("value");
};

export const listenTeachers = (plan, callbackFunction) => {
  const TeachersRef = db.ref(`${plan}/teachers`);
  return TeachersRef.on("value", callbackFunction);
};
