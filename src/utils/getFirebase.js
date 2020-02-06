const getFirebase = () => {
  return import(/* webpackChunkName: "firebase" */ 'firebase/app');
};

export default getFirebase;
