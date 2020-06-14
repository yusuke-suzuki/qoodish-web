import { v1 as uuidv1 } from 'uuid';
import getFirebase from './getFirebase';
import getFirebaseStorage from './getFirebaseStorage';

const uploadToStorage = (image, dir = 'images', fileType = 'blob') => {
  return new Promise(async (resolve, reject) => {
    await getFirebaseStorage();
    const firebase = await getFirebase();

    const storage = firebase.app().storage(process.env.FIREBASE_IMAGE_BUCKET);
    const storageRef = storage.ref();

    const metadata = {
      contentType: 'image/jpeg',
      cacheControl: `public,max-age=${30 * 24 * 60 * 60}` // 30 Days
    };

    const fileName = `${dir}/${uuidv1()}.jpg`;

    let uploadTask;
    if (fileType === 'blob') {
      uploadTask = storageRef.child(fileName).put(image, metadata);
    } else if (fileType === 'data_url') {
      uploadTask = storageRef
        .child(fileName)
        .putString(image, 'data_url', metadata);
    } else {
      uploadTask = storageRef
        .child(fileName)
        .putString(image, fileType, metadata);
    }

    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      snapshot => {
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED:
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING:
            break;
        }
      },
      error => {
        switch (error.code) {
          case 'storage/unauthorized':
            break;
          case 'storage/canceled':
            break;
          case 'storage/unknown':
            break;
        }
        reject();
      },
      () => {
        const imageUrl = `${process.env.CLOUD_STORAGE_ENDPOINT}/${process.env.CLOUD_STORAGE_BUCKET_NAME}/${fileName}`;
        resolve({
          imageUrl: imageUrl,
          fileName: uploadTask.snapshot.ref.name
        });
      }
    );
  });
};

export default uploadToStorage;
