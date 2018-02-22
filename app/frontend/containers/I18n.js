const en = require('../locales/en.json');
const ja = require('../locales/ja.json');

class I18n {
  static t(key) {
    switch (window.currentLocale) {
      case 'ja':
        return ja[key];
        break;
      default:
        return en[key];
    }
  }
}

export default I18n;
