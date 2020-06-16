const detectCurrentLocale = () => {
  const parsedUrl = new URL(window.location.href);
  const hl = parsedUrl.searchParams.get('hl');

  return (
    hl ||
    window.navigator.language ||
    window.navigator.userLanguage ||
    window.navigator.browserLanguage
  );
};

export default detectCurrentLocale;
