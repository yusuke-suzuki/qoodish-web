const getFirebaseStorage = () => {
  return import(/* webpackChunkName: "firebase_storage" */ '@firebase/storage');
};

export default getFirebaseStorage;
