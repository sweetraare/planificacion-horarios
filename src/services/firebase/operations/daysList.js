import { databaseFirebase as db } from "../config";

const DaysListRef = db.ref("/Days_List");

export const addDaysList = (Days_List) => {
  return DaysListRef.set(Days_List);
};

export const getDaysList = () => {
  return DaysListRef.once("value");
};

export const listenDaysList = (callbackFunction) => {
  return DaysListRef.on("value", callbackFunction);
};
