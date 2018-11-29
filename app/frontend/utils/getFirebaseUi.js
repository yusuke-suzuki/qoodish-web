const getFirebaseUi = () => {
  return import(/* webpackChunkName: "firebase_ui" */ 'firebaseui');
};

export default getFirebaseUi;
