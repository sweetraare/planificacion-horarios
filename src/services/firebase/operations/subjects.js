import { databaseFirebase as db } from "../config";

// const SubjectsRef = db.ref("/subjects");

export const addSubject = (plan, slug, subject) => {
  const SubjectsRef = db.ref(`${plan}/subjects`);
  return SubjectsRef.child(slug).update({ ...subject });
};

export const removeAllSubjects = (plan) => {
  const SubjectsRef = db.ref(`${plan}/subjects`);
  return SubjectsRef.remove();
};

// export const editPlanProperty = (slug, property, value) => {
//   return PlansRef.child(slug).child(property).update(value);
// };

export const getSubjects = (plan) => {
  const SubjectsRef = db.ref(`${plan}/subjects`);
  return SubjectsRef.once("value");
};

export const listenSubjects = (plan, callbackFunction) => {
  const SubjectsRef = db.ref(`${plan}/subjects`);
  return SubjectsRef.on("value", callbackFunction);
};
