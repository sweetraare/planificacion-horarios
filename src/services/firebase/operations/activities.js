import { databaseFirebase as db } from "../config";

export const addActivity = (plan, slug, activity) => {
  const ActivitiesRef = db.ref(`${plan}/activities`);
  return ActivitiesRef.child(slug).update({ ...activity });
};

export const removeAllActivities = (plan) => {
  const ActivitiesRef = db.ref(`${plan}/activities`);
  return ActivitiesRef.remove();
};

export const getActivities = (plan) => {
  const ActivitiesRef = db.ref(`${plan}/activities`);
  return ActivitiesRef.once("value");
};

export const listenActivities = (plan, callbackFunction) => {
  const ActivitiesRef = db.ref(`${plan}/activities`);
  return ActivitiesRef.on("value", callbackFunction);
};
