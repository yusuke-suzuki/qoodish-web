import fetch from 'node-fetch';
const functions = require('firebase-functions');

class QoodishClient {
  async fetchMapMetadata(mapId, locale) {
    const url = `${functions.config().app.api_endpoint}/maps/${mapId}/metadata`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchReviewMetadata(reviewId, locale) {
    const url = `${functions.config().app.api_endpoint}/reviews/${reviewId}/metadata`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale
      }
    };
    const response = await fetch(url, options);
    return response;
  }

  async fetchSpotMetadata(placeId, locale) {
    const url = `${functions.config().app.api_endpoint}/spots/${placeId}/metadata`;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale
      }
    };
    const response = await fetch(url, options);
    return response;
  }
}

export default QoodishClient;
