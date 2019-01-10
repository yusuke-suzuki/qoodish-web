const QoodishClient = require('./QoodishClient');

const generateMetadata = async req => {
  let title = 'Qoodish';
  let description =
    'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。';
  let pageUrl = process.env.ENDPOINT;
  let imageUrl = process.env.SUBSTITUTE_URL;
  let twitterCard = 'summary';

  const client = new QoodishClient();
  let response;
  let json;
  if (req.params.reviewId) {
    response = await client.fetchReviewMetadata(
      req.params.reviewId,
      req.headers['accept-language']
    );
    if (response.ok) {
      json = await response.json();
      title = `${json.title} | Qoodish`;
      description = json.description;
      imageUrl = json.image_url;
      pageUrl = req.originalUrl;
      twitterCard = 'summary_large_image';
    }
  } else if (req.params.mapId) {
    response = await client.fetchMapMetadata(
      req.params.mapId,
      req.headers['accept-language']
    );
    if (response.ok) {
      json = await response.json();
      title = `${json.title} | Qoodish`;
      description = json.description;
      imageUrl = json.image_url;
      pageUrl = req.originalUrl;
      twitterCard = 'summary_large_image';
    }
  } else if (req.params.placeId) {
    response = await client.fetchSpotMetadata(
      req.params.placeId,
      req.headers['accept-language']
    );
    if (response.ok) {
      json = await response.json();
      title = `${json.title} | Qoodish`;
      description = json.description;
      imageUrl = json.image_url;
      pageUrl = req.originalUrl;
      twitterCard = 'summary_large_image';
    }
  }

  const metadata = {
    description: description,
    og: {
      title: title,
      description: description,
      url: pageUrl,
      image: imageUrl
    },
    twitter: {
      title: title,
      image: imageUrl,
      description: description,
      card: twitterCard
    }
  };
  return metadata;
};

module.exports = generateMetadata;
