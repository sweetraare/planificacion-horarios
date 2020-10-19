import { databaseFirebase as db } from "../config";

const HoursListRef = db.ref("/Hours_List");

export const addHoursList = (Hours_List) => {
  return HoursListRef.set(Hours_List);
};

export const getHoursList = () => {
  return HoursListRef.once("value");
};

export const listenHoursList = (callbackFunction) => {
  return HoursListRef.on("value", callbackFunction);
};
