import fetch from 'node-fetch';

class QoodishClient {
  async fetchMapMetadata(mapId, locale) {
    const url = `${process.env.API_ENDPOINT}/maps/${mapId}/metadata`;
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
    const url = `${process.env.API_ENDPOINT}/reviews/${reviewId}/metadata`;
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
