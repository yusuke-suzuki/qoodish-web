const fetchMetadata = require(__dirname + '/fetchMetadata');

const defaultMetadata = {
  title: 'Qoodish',
  description:
    'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。',
  image: process.env.SUBSTITUTE_URL,
  type: 'website',
  url: process.env.ENDPOINT,
  twitterCard: 'summary'
};

const generateMetadata = async req => {
  const metadata = Object.assign({}, defaultMetadata);
  const resourceMetadata = await fetchMetadata(req);

  if (resourceMetadata) {
    Object.assign(metadata, {
      title: `${metadata.title} | Qoodish`,
      description: metadata.description,
      image: metadata.image_url,
      type: 'article',
      url: req.originalUrl,
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
      image: metadata.imageUrl
    },
    twitter: {
      title: metadata.title,
      image: metadata.imageUrl,
      description: metadata.description,
      card: metadata.twitterCard
    }
  };
};

module.exports = generateMetadata;
