const DEFAULT_LOCALE = 'en';

export const detectLanguage = (request) => {
  const acceptLanguage = request.headers['accept-language'];
  if (!acceptLanguage || !acceptLanguage.split(',')[0]) {
    return DEFAULT_LOCALE;
  } else {
    return acceptLanguage.split(',')[0];
  }
}
