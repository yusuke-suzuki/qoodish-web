const detectDevice = () => {
  return window.navigator.userAgent.toLowerCase();
};

export const useIOS = () => {
  const userAgent = detectDevice();
  if (userAgent.indexOf('iphone') != -1 || userAgent.indexOf('ipad') != -1) {
    return true;
  } else {
    return false;
  }
};

export const useAndroid = () => {
  const userAgent = detectDevice();
  if (userAgent.indexOf('android') != -1) {
    return true;
  } else {
    return false;
  }
};
