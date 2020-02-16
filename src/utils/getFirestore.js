const getFirestore = () => {
  return import(
    /* webpackChunkName: "firestore" */ '@firebase/firestore/dist/index.cjs.min'
  );
};

export default getFirestore;
