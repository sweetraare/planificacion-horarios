import { databaseFirebase as db } from "../config";

export const addTag = (plan, slug, tag) => {
  const TagsRef = db.ref(`${plan}/tags`);
  return TagsRef.child(slug).update({ ...tag });
};

export const removeAllTags = (plan) => {
  const TagsRef = db.ref(`${plan}/tags`);
  return TagsRef.remove();
};

export const getTags = (plan) => {
  const TagsRef = db.ref(`${plan}/tags`);
  return TagsRef.once("value");
};

export const listenTags = (plan, callbackFunction) => {
  const TagsRef = db.ref(`${plan}/tags`);
  return TagsRef.on("value", callbackFunction);
};
