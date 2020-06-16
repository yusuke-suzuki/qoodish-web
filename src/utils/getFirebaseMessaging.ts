const getFirebaseMessaging = () => {
  return import(/* webpackChunkName: "firebase_messaging" */ '@firebase/messaging');
};

export default getFirebaseMessaging;
