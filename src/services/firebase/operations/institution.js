import {databaseFirebase as db} from "../config";

const InstitutionRef = db.ref("/Institution_Name");

export const addInstitution = (institution) => {
  return InstitutionRef.set(institution);
};

export const getInstitution = () => {
  return InstitutionRef.once("value");
};

export const listenInstitution = (callbackFunction) => {
  return InstitutionRef.on('value', callbackFunction);
};


const CommentsRef = db.ref("/Comments");

export const addComments = (comments) => {
  return CommentsRef.set(comments);
};

export const getComments = () => {
  return CommentsRef.once("value");
};

export const listenComments = (callbackFunction) => {
  return CommentsRef.on('value', callbackFunction);
};
