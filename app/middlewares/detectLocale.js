const DEFAULT_LOCALE = 'en';

const detectLocale = async (ctx, next) => {
  const acceptLanguage = ctx.request.headers['accept-language'];
  let currentLocale;
  if (!acceptLanguage || !acceptLanguage.split(',')[0]) {
    currentLocale = DEFAULT_LOCALE;
  } else {
    currentLocale = acceptLanguage.split(',')[0];
  }
  ctx.currentLocale = currentLocale;
  await next();
}

export default detectLocale;
