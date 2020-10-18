export default function fetchCurrentPosition(): Promise<any> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false
    });
  });
}
