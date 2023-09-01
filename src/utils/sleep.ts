const sleep = (msec) => {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, msec);
  });
};

export default sleep;
