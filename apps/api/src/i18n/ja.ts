import type { Messages } from './en.ts';

export const ja: Messages = {
  error_400: '不正なリクエストです。',
  error_401: '認証エラーが発生しました。',
  error_403: '許可されていない操作です。',
  error_404: 'リソースが見つかりませんでした。',
  error_409: 'リクエストの内容が競合しています。',
  error_422: 'リクエストの内容が不正です。',
  error_429: 'リクエストが多すぎます。しばらくしてからやり直してください。',
  error_500: 'サーバー内部エラーが発生しました。',
  error_separator: '',

  duplicate_map_name: '既に存在する地図の名前です。',
  map_name_required: '地図の名前を入力してください。',
  map_name_exceed: '地図の名前が長すぎます。(最大: 30 文字)',
  map_description_required: '地図の説明を入力してください。',
  map_description_exceed: '地図の説明が長すぎます。(最大: 200 文字)',
  map_author_not_specified: '地図の著者を指定してください。',

  comment_required: 'コメントを入力してください。',
  comment_exceeded: 'コメントが長すぎます。(最大: 500 文字)',
  invalid_uri: '不正な URL です。',
  images_per_report_reached_limit: 'レポートごとの画像数の上限に達しました。',

  coauthor_already_author: '著者を共著者にはできません。',
  duplicate_coauthor: '既に共著者として追加されています。',
  bookmark_map_not_public: 'ブックマークできるのは公開されている地図のみです。',
  bookmark_map_editable:
    '著者・共著者は自身が編集できる地図をブックマークできません。',
  duplicate_bookmark: '既にブックマーク済みです。',
  invitation_invitee_already_author:
    '著者を共著者として招待することはできません。',
  duplicate_pending_invitation: 'このユーザーへの招待は既に保留中です。',

  registration_token_is_required: '登録トークンを入力してください。',
  registration_token_is_duplicated: '既に登録されているトークンです。',

  duplicate_unfinished_journey: 'この地図には未完了の旅が既にあります。',
  journey_already_started: 'この旅は既に開始されています。',
  journey_not_started: 'この旅はまだ開始されていません。',
  journey_already_finished: 'この旅は既に終了しています。',
  journey_not_in_progress: '進行中の旅ではありません。',
  journey_encoded_path_exceed: '旅の経路データが大きすぎます。',
  duplicate_milestone: 'このピンは既にマイルストーンに追加されています。',
  duplicate_checkin: 'このピンには既にチェックイン済みです。',
  pin_not_on_journey_map: 'このピンは旅の地図に属していません。',
  images_per_checkin_reached_limit:
    'チェックインごとの画像数の上限に達しました。',
  checkin_note_exceeded: 'メモが長すぎます。(最大: 500 文字)',
  checkin_time_outside_journey_period: 'チェックイン時刻が旅の期間外です。',

  chapter_title_required: 'チャプターのタイトルを入力してください。',
  chapter_title_exceed: 'チャプターのタイトルが長すぎます。(最大: 100 文字)',
  chapter_content_invalid: 'チャプターの本文の形式が正しくありません。',
  chapter_content_exceed: 'チャプターの本文が大きすぎます。',
  chapter_map_features_invalid:
    'チャプターの地図データの形式が正しくありません。',
  chapter_map_features_exceed: 'チャプターの地図データが大きすぎます。',
  chapter_journey_mismatch:
    '指定された旅はチャプターの著者または地図に属していません。',
  duplicate_chapter_for_journey: 'この旅のチャプターは既に作成されています。',

  pin_property_name_required: 'タグの名前を入力してください。',
  pin_property_name_exceed: 'タグの名前が長すぎます。(最大: 30 文字)',
  pin_property_option_name_required: '選択肢の名前を入力してください。',
  pin_property_option_name_exceed: '選択肢の名前が長すぎます。(最大: 30 文字)',

  journal_title_required: '手帳のタイトルを入力してください。',
  journal_title_exceed: '手帳のタイトルが長すぎます。(最大: 50 文字)',
  journal_description_exceed: '手帳の説明が長すぎます。(最大: 200 文字)',
  journal_bookmark_own: '著者は自身の手帳をブックマークできません。',
  duplicate_journal_bookmark: '既にブックマーク済みです。',

  report_type_not_supported: 'このコンテンツは報告できません。'
};
