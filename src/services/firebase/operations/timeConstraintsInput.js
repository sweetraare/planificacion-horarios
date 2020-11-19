import { databaseFirebase as db } from "../config";

export const addTimeConstraintInput = (plan, timeContraint) => {
  const timeContraintsInputRef = db.ref(`${plan}/timeContraintsInput`);
  return timeContraintsInputRef.push(timeContraint);
};

export const removeAlltimeContraintsInput = (plan) => {
  const timeContraintsInputRef = db.ref(`${plan}/timeContraintsInput`);
  return timeContraintsInputRef.remove();
};

export const getTimeContraintsInput = (plan) => {
  const timeContraintsInputRef = db.ref(`${plan}/timeContraintsInput`);
  return timeContraintsInputRef.once("value");
};

export const removeTimeConstriantInput = (plan, slug) => {
  const timeContraintsInputRef = db.ref(`${plan}/timeContraintsInput`);
  return timeContraintsInputRef.child(slug).remove();
};
export const listentimeContraintsInput = (plan, callbackFunction) => {
  const timeContraintsInputRef = db.ref(`${plan}/timeContraintsInput`);
  return timeContraintsInputRef.on("value", callbackFunction);
};
