import { databaseFirebase as db } from "../config";

export const addStudent = (plan, slug, student) => {
  const StudentsRef = db.ref(`${plan}/students`);
  return StudentsRef.child(slug).update({ ...student });
};

export const removeAllStudents = (plan) => {
  const StudentsRef = db.ref(`${plan}/students`);
  return StudentsRef.remove();
};

export const editTeacherProperty = (plan, slug, property, value) => {
  const StudentsRef = db.ref(`${plan}/students`);
  return StudentsRef.child(slug).child(property).update(value);
};

export const getStudents = (plan) => {
  const StudentsRef = db.ref(`${plan}/students`);
  return StudentsRef.once("value");
};

export const listenStudents = (plan, callbackFunction) => {
  const StudentsRef = db.ref(`${plan}/students`);
  return StudentsRef.on("value", callbackFunction);
};
