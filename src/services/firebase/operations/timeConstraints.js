import { databaseFirebase as db } from "../config";

export const addTimeConstraint = (plan, timeContraint) => {
  const TimeContraintsRef = db.ref(`${plan}/timeContraints`);
  return TimeContraintsRef.push(timeContraint);
};

export const removeAllTimeContraints = (plan) => {
  const TimeContraintsRef = db.ref(`${plan}/timeContraints`);
  return TimeContraintsRef.remove();
};

export const getTimeContraints = (plan) => {
  const TimeContraintsRef = db.ref(`${plan}/timeContraints`);
  return TimeContraintsRef.once("value");
};

export const listenTimeContraints = (plan, callbackFunction) => {
  const TimeContraintsRef = db.ref(`${plan}/timeContraints`);
  return TimeContraintsRef.on("value", callbackFunction);
};
