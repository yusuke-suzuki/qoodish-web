const fetchMetadata = require(__dirname + '/fetchMetadata');

const defaultMetadata = {
  title: 'Qoodish',
  description:
    'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。',
  image: process.env.OGP_IMAGE_URL,
  type: 'website',
  url: process.env.ENDPOINT,
  twitterCard: 'summary_large_image'
};

const generateMetadata = async req => {
  const metadata = Object.assign({}, defaultMetadata);
  const resourceMetadata = await fetchMetadata(req);

  if (resourceMetadata) {
    Object.assign(metadata, {
      title: `${resourceMetadata.title} | Qoodish`,
      description: resourceMetadata.description,
      image: resourceMetadata.image_url,
      type: 'article',
      url: `${process.env.ENDPOINT}${req.originalUrl}`,
      twitterCard: 'summary_large_image'
    });
  }

  return {
    description: metadata.description,
    og: {
      title: metadata.title,
      description: metadata.description,
      type: metadata.type,
      url: metadata.url,
      image: metadata.image
    },
    twitter: {
      title: metadata.title,
      image: metadata.image,
      description: metadata.description,
      card: metadata.twitterCard
    }
  };
};

module.exports = generateMetadata;
