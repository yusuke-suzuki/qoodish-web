const sleep = msec => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, msec);
  });
};

export default sleep;
