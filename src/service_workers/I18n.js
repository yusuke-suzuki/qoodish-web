const en = require('./locales/en.json');
const ja = require('./locales/ja.json');

class I18n {
  static t(key, currentLocale) {
    switch (currentLocale) {
      case 'ja':
      case 'ja-JP':
      case 'ja-jp':
        return ja[key];
      default:
        return en[key];
    }
  }
}

export default I18n;
