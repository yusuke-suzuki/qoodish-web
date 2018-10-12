import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/auth';
import uuidv1 from 'uuid/v1';
import 'blueimp-canvas-to-blob';

export const detectDevice = () => {
  return window.navigator.userAgent.toLowerCase();
};

export const useIOS = () => {
  const userAgent = detectDevice();
  if (userAgent.indexOf('iphone') != -1 || userAgent.indexOf('ipad') != -1) {
    return true;
  } else {
    return false;
  }
};

export const useAndroid = () => {
  const userAgent = detectDevice();
  if (userAgent.indexOf('android') != -1) {
    return true;
  } else {
    return false;
  }
};

export const fetchCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

export const uploadToStorage = (image, dir = 'images', fileType = 'blob') => {
  return new Promise((resolve, reject) => {
    const storage = firebase.app().storage(process.env.FIREBASE_IMAGE_BUCKET);
    const storageRef = storage.ref();
    const metadata = {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=86400',
    };
    const fileName = `${dir}/${uuidv1()}.jpg`;

    let uploadTask;
    if (fileType === 'blob') {
      uploadTask = storageRef
        .child(fileName)
        .put(image, metadata);
    } else {
      uploadTask = storageRef
        .child(fileName)
        .putString(image, fileType, metadata);
    }

    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      snapshot => {
        let progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
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
      async () => {
        const imageUrl = await storage.ref(fileName).getDownloadURL();
        resolve({
          imageUrl: imageUrl,
          fileName: uploadTask.snapshot.ref.name
        });
      }
    );
  });
};

export const deleteFromStorage = fileName => {
  return new Promise((resolve, reject) => {
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

export const downloadImage = url => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = e => {
      const blob = xhr.response;
      resolve(blob);
    };
    xhr.open('GET', url);
    xhr.send();
  });
};

export const sleep = msec => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, msec);
  });
};

export const canvasToBlob = canvas => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        resolve(blob);
      },
      'image/jpeg',
      0.5
    );
  });
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
}
