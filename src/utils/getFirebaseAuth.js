const getFirebaseAuth = () => {
  return import(/* webpackChunkName: "firebase_auth" */ '@firebase/auth');
};

export default getFirebaseAuth;
