import {databaseFirebase as db} from "../config";

const UsersRef = db.ref("/users");

export const addUser = (uid, params) => {
  return UsersRef.child(uid).update({...params});
};

export const userRemoveAttribute = (uid, attribute) => {
  return UsersRef.child(uid).child(attribute).remove();
};

export const getUsers = () => {
  return UsersRef.once("value", snapshot => snapshot.exists() ? snapshot.val() : []);
};

export const getClients = () => {
  return UsersRef.orderByChild('role').equalTo('client').once("value", snapshot => snapshot.exists() ? snapshot.val() : []);
};

export const getUsersByRole = (role) => {
  return UsersRef.orderByChild('role').equalTo(role).once("value", snapshot => snapshot.exists() ? snapshot.val() : []);
};

export const getUserById = uid => {
  return UsersRef.child(uid).once("value", snapshot => snapshot.exists() ? snapshot.val() : []);
};

export const searchUserByUserName = userName => {
  return UsersRef.orderByChild('userName').equalTo(userName).once("value");
};

export const listenUsers = (callbackFunction) => {
  return UsersRef.on('value', callbackFunction);
};

export const listenUser = (uid, callbackFunction) => {
  return UsersRef.child(uid).on('value', callbackFunction);
};

export const listenClients = (callbackFunction) => {
  return UsersRef.orderByChild('role').equalTo('client').on('value', callbackFunction);
};
