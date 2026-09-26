import type { Dictionary } from './dictionary.ts';

export const ja: Dictionary = {
  appName: 'Qoodish Admin',
  pendingReports: '判断待ちの報告',
  noPendingReports: '判断待ちの報告はありません。',
  report: (id) => `報告 #${id}`,
  backToReports: '判断待ちの報告に戻る',
  switchLanguage: 'English',
  categoryLabel: '報告の理由',
  categories: {
    spam: 'スパム・宣伝',
    harassment: '嫌がらせ・いじめ',
    hate: '差別・ヘイトスピーチ',
    sexual: '性的なコンテンツ',
    violence: '暴力的・残虐なコンテンツ',
    illegal: '違法な行為・コンテンツ',
    privacy: 'プライバシー侵害・名誉毀損',
    copyright: '著作権・商標などの権利侵害',
    impersonation: 'なりすまし',
    other: 'その他'
  },
  types: {
    Pin: 'ピン',
    Comment: 'コメント',
    Map: 'マップ',
    Chapter: 'チャプター',
    Journal: '手帳',
    User: 'アカウント'
  },
  statuses: {
    pending: '判断待ち',
    kept: '維持',
    removed: '非表示',
    unavailable: '対象なしで終了'
  },
  outcomes: {
    kept: '対象を維持する',
    removed: '対象を非表示にする',
    unavailable: '対象がないため終了する'
  },
  target: '対象',
  openTarget: '対象を開く',
  targetGone: '報告された対象はすでに存在しません。',
  editedSinceFiled:
    'この報告の後に対象が編集されています。下のスナップショットは報告時点の内容です。',
  reporter: '報告者',
  deletedReporter: '退会したユーザー',
  filedAt: '受付日時',
  reporterLanguage: '報告者の言語',
  languages: { en: '英語', ja: '日本語' },
  details: '詳しい内容',
  snapshot: '報告時点の内容',
  none: 'なし',
  otherPendingReports: '同じ対象への判断待ちの報告',
  decisionHistory: '判断の履歴',
  noDecisions: 'まだ判断はありません。',
  reviewedOtherRevision: '別のバージョンに対する判断',
  systemModerator: 'システム',
  decision: '判断',
  decisionScope:
    'この判断は、同じ対象への判断待ちの報告すべてへの回答になります。',
  reason: '理由',
  reasonHelp:
    '入力した内容がそのまま報告者に送られます。非表示にした場合は投稿者にも送られます。',
  recordDecision: '判断を記録',
  decisionRecorded: (id) => `報告 #${id} の判断を記録しました。`,
  invalidDecision: '判断を選び、理由を入力してください。',
  notFound: 'ページが見つかりません。',
  forbidden: 'この操作を行う権限がありません。',
  apiUnavailable: 'API に接続できませんでした。時間をおいて再度お試しください。'
};
