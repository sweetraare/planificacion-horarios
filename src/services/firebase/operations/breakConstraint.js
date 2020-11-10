import { databaseFirebase as db } from "../config";

export const addBreakConstraint = (plan, breakContraint) => {
  const BreakContraintsRef = db.ref(`${plan}/breakContraints`);
  return BreakContraintsRef.set(breakContraint);
};

export const removeAllBreakContraints = (plan) => {
  const BreakContraintsRef = db.ref(`${plan}/breakContraints`);
  return BreakContraintsRef.remove();
};

export const getBreakContraints = (plan) => {
  const BreakContraintsRef = db.ref(`${plan}/breakContraints`);
  return BreakContraintsRef.once("value");
};

export const listenBreakContraints = (plan, callbackFunction) => {
  const BreakContraintsRef = db.ref(`${plan}/breakContraints`);
  return BreakContraintsRef.on("value", callbackFunction);
};
