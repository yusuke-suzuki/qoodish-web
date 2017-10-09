import QoodishClient from './QoodishClient';

const BOTS = [
  '\\+https:\\/\\/developers.google.com\\/\\+\\/web\\/snippet\\/',
  'googlebot',
  'baiduspider',
  'gurujibot',
  'yandexbot',
  'slurp',
  'msnbot',
  'bingbot',
  'facebookexternalhit',
  'linkedinbot',
  'twitterbot',
  'slackbot',
  'telegrambot',
  'applebot',
  'pingdom',
  'tumblr '
];
const IS_BOT_REGEXP = new RegExp('^.*(' + BOTS.join('|') + ').*$');

const isBot = (request) => {
  let source = request.headers['user-agent'] || '';
  if (typeof source === 'undefined') {
    source = 'unknown';
  }
  let isBot = IS_BOT_REGEXP.exec(source.toLowerCase());
  if (isBot) {
    isBot = isBot[1];
  }
  return isBot;
};

export const generateMetadata = async (request, params, locale) => {
  let title = 'Qoodish (β)';
  let description = 'Qoodish では友だちとマップを作成してお気に入りのお店や観光スポットなどの情報をシェアすることができます。';
  let pageUrl = process.env.ENDPOINT;
  let imageUrl = process.env.OG_IMAGE_URL;

  if (isBot(request)) {
    const client = new QoodishClient;
    let response;
    let json;
    if (params.reviewId) {
      response = await client.fetchReviewMetadata(params.reviewId, locale);
      if (response.ok) {
        json = await response.json();
        title = `${json.title} | Qoodish (β)`
        description = json.description;
        imageUrl = json.image_url;
        pageUrl = request.originalUrl;
      }
    } else if (params.mapId) {
      response = await client.fetchMapMetadata(params.mapId, locale);
      if (response.ok) {
        json = await response.json();
        title = `${json.title} | Qoodish (β)`
        description = json.description;
        imageUrl = json.image_url;
        pageUrl = request.originalUrl;
      }
    }
  }

  let metadata = {
    description: description,
    og: {
      title: title,
      description: description,
      url: pageUrl,
      image: imageUrl
    },
    twitter: {
      image: imageUrl,
      description: description
    }
  };
  return metadata;
}
