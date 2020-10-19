import { databaseFirebase as db } from "../config";

const PlansRef = db.ref("/plans");

export const addPlan = (plan) => {
  return PlansRef.push(plan);
};

export const getPlans = () => {
  return PlansRef.once("value");
};

export const listenPlans = (callbackFunction) => {
  return PlansRef.on("value", callbackFunction);
};
