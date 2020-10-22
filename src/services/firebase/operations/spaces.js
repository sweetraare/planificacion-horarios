import { databaseFirebase as db } from "../config";

export const addSpace = (plan, slug, type, space) => {
  const SpacesRef = db.ref(`${plan}/spaces`);
  return SpacesRef.child(slug)
    .child(type)
    .update({ ...space });
};

export const removeAllSpaces = (plan) => {
  const SpacesRef = db.ref(`${plan}/spaces`);
  return SpacesRef.remove();
};

export const getSpaces = (plan, type) => {
  const SpacesRef = db.ref(`${plan}/spaces`);
  return SpacesRef.child(type).once("value");
};

export const listenSpaces = (plan, type, callbackFunction) => {
  const SpacesRef = db.ref(`${plan}/spaces`);
  return SpacesRef.child(type).on("value", callbackFunction);
};
