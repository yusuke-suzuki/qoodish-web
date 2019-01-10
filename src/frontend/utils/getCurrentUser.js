import getFirebase from './getFirebase';
import getFirebaseAuth from './getFirebaseAuth';

const getCurrentUser = () => {
  return new Promise(async (resolve, reject) => {
    await getFirebaseAuth();
    const firebase = await getFirebase();

    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
};

export default getCurrentUser;
