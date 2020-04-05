const getFirestore = () => {
  return import(/* webpackChunkName: "firestore" */ '@firebase/firestore');
};

export default getFirestore;
