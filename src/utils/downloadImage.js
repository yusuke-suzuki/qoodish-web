const downloadImage = url => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = e => {
      const blob = xhr.response;
      resolve(blob);
    };
    xhr.open('GET', url);
    xhr.send();
  });
};

export default downloadImage;
