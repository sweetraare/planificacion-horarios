import {storage} from "./config";

const imageRef = storage.ref();

export const uploadPhoto = (path, name, file) => {
  return imageRef.child(path).child(name).put(file);
};
export const downloadUrlPhoto = (path, id) => {
  return imageRef.child(path).child(id).getDownloadURL();
};

export const listAllPhotos = (path) => {
  return imageRef.child(path).listAll();
}
