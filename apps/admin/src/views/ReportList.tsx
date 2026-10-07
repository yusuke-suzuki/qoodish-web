import type { Dictionary } from '../i18n/dictionary.ts';
import { dictionaryFor, type Locale } from '../i18n/index.ts';
import type { Report } from '../reports.ts';
import { formatDateTime } from './format.ts';
import { Layout } from './Layout.tsx';

export function reporterLabel(report: Report, dict: Dictionary): string {
  return report.reporter?.name ?? dict.deletedReporter;
}

type Props = {
  locale: Locale;
  timeZone: string;
  reports: Report[];
  decidedId: number | null;
};

export function ReportList({ locale, timeZone, reports, decidedId }: Props) {
  const dict = dictionaryFor(locale);

  return (
    <Layout locale={locale} title={dict.pendingReports} path="/reports">
      <h1>{dict.pendingReports}</h1>

      {decidedId !== null && (
        <p class="notice" role="status">
          {dict.decisionRecorded(decidedId)}
        </p>
      )}

      {reports.length === 0 ? (
        <p class="muted">{dict.noPendingReports}</p>
      ) : (
        <ul class="report-list">
          {reports.map((report) => (
            <li key={report.id}>
              <a href={`/${locale}/reports/${report.id}`}>
                <span class="report-title">
                  {`#${report.id} ${dict.categories[report.category]}`}
                </span>
                <span class="muted">
                  {[
                    `${dict.types[report.moderatable_type]} ${report.moderatable_id}`,
                    reporterLabel(report, dict),
                    formatDateTime(report.created_at, locale, timeZone)
                  ].join(' · ')}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}
