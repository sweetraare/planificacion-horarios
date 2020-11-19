import { databaseFirebase as db } from "../config";

export const addSpaceConstraint = (plan, slug, spaceConstraint) => {
  const SpaceContraintsRef = db.ref(`${plan}/spaceContraints`);
  return SpaceContraintsRef.child(slug).update({ ...spaceConstraint });
};

export const removeSpaceConstraint = (plan, slug) => {
  const SpaceContraintsRef = db.ref(`${plan}/spaceContraints`);
  return SpaceContraintsRef.child(slug).remove();
};

export const removeAllSpaceContraints = (plan) => {
  const SpaceContraintsRef = db.ref(`${plan}/spaceContraints`);
  return SpaceContraintsRef.remove();
};

export const getSpaceContraints = (plan) => {
  const SpaceContraintsRef = db.ref(`${plan}/spaceContraints`);
  return SpaceContraintsRef.once("value");
};

export const listenSpaceContraints = (plan, callbackFunction) => {
  const SpaceContraintsRef = db.ref(`${plan}/spaceContraints`);
  return SpaceContraintsRef.on("value", callbackFunction);
};
