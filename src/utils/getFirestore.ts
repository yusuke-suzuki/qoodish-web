const getFirestore = () => {
  return import(
    /* webpackChunkName: "firestore" */ 'firebase/firestore/memory'
  );
};

export default getFirestore;
