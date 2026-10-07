import { dictionaryFor, type Locale } from '../i18n/index.ts';
import { Layout } from './Layout.tsx';

type Props = {
  locale: Locale;
  message: string;
};

export function Message({ locale, message }: Props) {
  const dict = dictionaryFor(locale);

  return (
    <Layout locale={locale} title={message} path="/reports">
      <p>{message}</p>
      <p>
        <a href={`/${locale}/reports`}>{dict.backToReports}</a>
      </p>
    </Layout>
  );
}
