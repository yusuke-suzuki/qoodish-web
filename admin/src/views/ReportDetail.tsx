import type { Child } from 'hono/jsx';
import { dictionaryFor, type Locale } from '../i18n/index.ts';
import {
  allowedOutcomes,
  httpUrl,
  type ModerationOutcome,
  publicPath,
  type ReportDetail as ReportDetailData
} from '../reports.ts';
import { formatDateTime } from './format.ts';
import { Layout } from './Layout.tsx';
import { reporterLabel } from './ReportList.tsx';

export type DecisionFormState = {
  outcome: ModerationOutcome | null;
  reason: string;
  error: string | null;
};

const EMPTY_FORM: DecisionFormState = {
  outcome: null,
  reason: '',
  error: null
};

type Props = {
  locale: Locale;
  timeZone: string;
  webEndpoint: string;
  report: ReportDetailData;
  form?: DecisionFormState;
};

function Field({ label, children }: { label: string; children: Child }) {
  return (
    <div class="field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function ReportDetail({
  locale,
  timeZone,
  webEndpoint,
  report,
  form = EMPTY_FORM
}: Props) {
  const dict = dictionaryFor(locale);
  const title = dict.report(report.id);
  const targetPath = report.target_available ? publicPath(report) : null;
  const targetUrl = targetPath ? new URL(targetPath, webEndpoint).href : null;
  const evidenceUrl = httpUrl(report.evidence_url);
  const format = (value: string) => formatDateTime(value, locale, timeZone);

  return (
    <Layout locale={locale} title={title} path={`/reports/${report.id}`}>
      <p>
        <a href={`/${locale}/reports`}>{dict.backToReports}</a>
      </p>

      <h1>
        {title}{' '}
        <span class={`badge badge-${report.status}`}>
          {dict.statuses[report.status]}
        </span>
      </h1>

      {!report.target_available && <p class="notice">{dict.targetGone}</p>}
      {report.edited_since_filed && (
        <p class="notice notice-warning">{dict.editedSinceFiled}</p>
      )}

      <section class="card">
        <dl>
          <Field label={dict.categoryLabel}>
            {dict.categories[report.category]}
          </Field>
          <Field label={dict.target}>
            {`${dict.types[report.moderatable_type]} ${report.moderatable_id}`}
            {targetUrl && (
              <>
                {' '}
                <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                  {dict.openTarget}
                </a>
              </>
            )}
          </Field>
          <Field label={dict.reporter}>{reporterLabel(report, dict)}</Field>
          <Field label={dict.filedAt}>{format(report.created_at)}</Field>
          <Field label={dict.reporterLanguage}>
            {dict.languages[report.locale] ?? report.locale}
          </Field>
          <Field label={dict.details}>
            <p class="prewrap">{report.details || dict.none}</p>
          </Field>
          <Field label={dict.evidenceUrl}>
            {evidenceUrl ? (
              <a
                href={evidenceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {evidenceUrl}
              </a>
            ) : (
              dict.none
            )}
          </Field>
          <Field label={dict.snapshot}>
            <p class="prewrap">{report.content_snapshot || dict.none}</p>
          </Field>
        </dl>
      </section>

      {report.other_pending_reports.length > 0 && (
        <section class="card">
          <h2>{dict.otherPendingReports}</h2>
          <ul class="report-list">
            {report.other_pending_reports.map((other) => (
              <li key={other.id}>
                <a href={`/${locale}/reports/${other.id}`}>
                  <span class="report-title">
                    {`#${other.id} ${dict.categories[other.category]}`}
                  </span>
                  <span class="muted">
                    {`${reporterLabel(other, dict)} · ${format(other.created_at)}`}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section class="card">
        <h2>{dict.decisionHistory}</h2>
        {report.decisions.length === 0 ? (
          <p class="muted">{dict.noDecisions}</p>
        ) : (
          <ol class="history">
            {report.decisions.map((decision) => (
              <li key={decision.id}>
                <p>
                  <span class={`badge badge-${decision.outcome}`}>
                    {dict.statuses[decision.outcome]}
                  </span>{' '}
                  <span class="muted">
                    {`${format(decision.created_at)} · ${decision.moderator_email ?? dict.systemModerator}`}
                  </span>
                  {!decision.reviewed_as_filed && (
                    <span class="warning"> {dict.reviewedOtherRevision}</span>
                  )}
                </p>
                <p class="prewrap">{decision.reason}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section class="card">
        <form method="post" action={`/${locale}/reports/${report.id}/decision`}>
          <fieldset>
            <legend>
              <h2>{dict.decision}</h2>
            </legend>
            <p class="muted">{dict.decisionScope}</p>
            {form.error && (
              <p class="notice notice-error" role="alert">
                {form.error}
              </p>
            )}
            {allowedOutcomes(
              report.moderatable_type,
              report.target_available
            ).map((outcome) => (
              <label key={outcome} class="choice">
                <input
                  type="radio"
                  name="outcome"
                  value={outcome}
                  required
                  checked={form.outcome === outcome}
                />
                {dict.outcomes[outcome]}
              </label>
            ))}
          </fieldset>

          <label class="stacked" for="reason">
            {dict.reason}
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={4}
            required
            aria-describedby="reason-help"
          >
            {form.reason}
          </textarea>
          <p id="reason-help" class="muted">
            {dict.reasonHelp}
          </p>

          <button type="submit">{dict.recordDecision}</button>
        </form>
      </section>
    </Layout>
  );
}
