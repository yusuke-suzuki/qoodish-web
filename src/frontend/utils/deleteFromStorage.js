import getFirebase from './getFirebase';
import getFirebaseStorage from './getFirebaseStorage';

const deleteFromStorage = fileName => {
  return new Promise(async (resolve, reject) => {
    await getFirebaseStorage();
    const firebase = await getFirebase();

    fileName = fileName.split('?')[0];
    const storage = firebase.app().storage(process.env.FIREBASE_IMAGE_BUCKET);
    const storageRef = storage.ref();
    storageRef
      .child('images/' + fileName)
      .delete()
      .then(() => {
        console.log('Successfully deleted image');
        resolve();
      })
      .catch(error => {
        console.log('Failed to delete image');
        reject(error);
      });
  });
};

export default deleteFromStorage;
