const en = require('../locales/en.json');
const ja = require('../locales/ja.json');

const I18n = {
  _locale: 'en',

  set locale(locale) {
    this._locale = locale;
  },

  get locale() {
    return this._locale;
  },

  t(key) {
    switch (this._locale) {
      case 'ja':
      case 'ja-JP':
      case 'ja-jp':
        return ja[key];
      default:
        return en[key];
    }
  }
};

export default I18n;
