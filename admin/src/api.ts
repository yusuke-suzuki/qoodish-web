import { ACCESS_JWT_HEADER } from './access.ts';
import type { Locale } from './i18n/index.ts';
import type { DecisionInput, Report, ReportDetail } from './reports.ts';

const API_TIMEOUT_MS = 15000;

export class ApiUnavailableError extends Error {}

export type ApiContext = {
  endpoint: string;
  assertion: string;
  locale: Locale;
};

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; detail: string | null };

async function request<T>(
  context: ApiContext,
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  let res: Response;

  try {
    res = await fetch(`${context.endpoint}${path}`, {
      ...init,
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
      headers: {
        Accept: 'application/json',
        'Accept-Language': context.locale,
        'Content-Type': 'application/json',
        [ACCESS_JWT_HEADER]: context.assertion
      }
    });
  } catch (error) {
    throw new ApiUnavailableError(`${path}: ${String(error)}`);
  }

  if (res.status >= 500) {
    throw new ApiUnavailableError(`${path}: status ${res.status}`);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      detail?: string;
    } | null;
    return { ok: false, status: res.status, detail: body?.detail ?? null };
  }

  return { ok: true, data: (await res.json()) as T };
}

export function listPendingReports(
  context: ApiContext
): Promise<ApiResponse<Report[]>> {
  return request(context, '/admin/reports');
}

export function getReport(
  context: ApiContext,
  reportId: string
): Promise<ApiResponse<ReportDetail>> {
  return request(context, `/admin/reports/${encodeURIComponent(reportId)}`);
}

export function decideReport(
  context: ApiContext,
  reportId: string,
  decision: DecisionInput
): Promise<ApiResponse<unknown>> {
  return request(
    context,
    `/admin/reports/${encodeURIComponent(reportId)}/decision`,
    { method: 'POST', body: JSON.stringify(decision) }
  );
}
