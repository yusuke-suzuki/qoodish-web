const fetchMetadata = async req => {
  let url;
  if (req.params.reviewId) {
    url = `${process.env.API_ENDPOINT}/reviews/${req.params.reviewId}/metadata`;
  } else if (req.params.mapId) {
    url = `${process.env.API_ENDPOINT}/maps/${req.params.mapId}/metadata`;
  } else if (req.params.placeId) {
    url = `${process.env.API_ENDPOINT}/spots/${placeId}/metadata`;
  } else {
    return;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': req.headers['accept-language']
    }
  });

  if (response.ok) {
    return await response.json();
  } else {
    return;
  }
};

module.exports = fetchMetadata;
