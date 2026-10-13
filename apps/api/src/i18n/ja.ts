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

  user_name_required: '名前を入力してください。',
  user_biography_exceed: '自己紹介が長すぎます。(最大: 160 文字)',
  image_not_owned: 'ご自身でアップロードした画像ではありません。',
  web_push_invalid: '通知の設定はオンかオフで指定してください。',

  duplicate_map_name: '既に存在する地図の名前です。',
  map_name_required: '地図の名前を入力してください。',
  map_name_exceed: '地図の名前が長すぎます。(最大: 30 文字)',
  map_description_required: '地図の説明を入力してください。',
  map_description_exceed: '地図の説明が長すぎます。(最大: 200 文字)',
  map_author_not_specified: '地図の著者を指定してください。',
  map_images_exceed: '地図に添付できる画像は 1 枚までです。',

  pin_name_required: 'ピンの名前を入力してください。',
  pin_name_exceed: 'ピンの名前が長すぎます。(最大: 100 文字)',
  pin_location_required: 'ピンの場所を選んでください。',
  pin_images_exceed: 'ピンに添付できる画像は 4 枚までです。',
  pin_property_options_invalid:
    '選んだタグの中に、このピンには使えないものがあります。',

  like_blocked_interaction:
    'ブロックしている、またはブロックされているアカウントの投稿にはいいねできません。',

  comment_blocked_interaction:
    'ブロックしている、またはブロックされているアカウントの投稿にはコメントできません。',
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
  bookmark_blocked_interaction:
    'ブロックしている、またはブロックされているアカウントの地図はブックマークできません。',
  invitation_invitee_already_author:
    '著者を共著者として招待することはできません。',
  invitation_blocked_interaction:
    'あなたか地図の著者がブロックしている、またはブロックされているアカウントは共著者に招待できません。',
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
  chapter_status_invalid: 'チャプターの公開状態が正しくありません。',
  chapter_images_exceed: 'チャプターに添付できる画像は 1 枚までです。',
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
  journal_bookmark_blocked_interaction:
    'ブロックしている、またはブロックされているアカウントの手帳はブックマークできません。',

  block_self: 'アカウントがご自身のため、ブロックできません。',
  mute_self: 'アカウントがご自身のため、ミュートできません。',

  report_type_not_supported: 'このコンテンツは報告できません。',
  report_category_invalid: '報告の理由を選択してください。',
  report_details_required: '詳しい内容をご記入ください。',
  report_details_exceed: '詳しい内容は 2000 文字以内でご記入ください。',
  report_own_content: '報告者が投稿者本人のため報告できません。',
  duplicate_pending_report:
    '対象はすでに報告を受け付けており、確認が完了するまで再度報告することはできません。',

  report_category_spam: 'スパム・宣伝',
  report_category_harassment: '嫌がらせ・いじめ',
  report_category_hate: '差別・ヘイトスピーチ',
  report_category_sexual: '性的なコンテンツ',
  report_category_violence: '暴力的・残虐なコンテンツ',
  report_category_illegal: '違法な行為・コンテンツ',
  report_category_privacy: 'プライバシー侵害・名誉毀損',
  report_category_copyright: '著作権・商標などの権利侵害',
  report_category_impersonation: 'なりすまし',
  report_category_other: 'その他',

  moderation_outcome_kept:
    '利用規約に違反するとは判断しなかったため、報告された投稿の削除その他の措置は行いませんでした。',
  moderation_outcome_removed:
    '利用規約に違反すると判断し、報告された投稿を削除しました。',
  moderation_outcome_unavailable:
    '確認した時点で、報告された投稿はすでに削除されていました。',

  decision_outcome_invalid: '対応結果を選択してください。',
  decision_reason_required: '理由を入力してください。',
  decision_target_gone:
    '対象は既に存在しません。「対象がないため終了する」を選んでください。',
  decision_target_present:
    '対象はまだ存在します。「対象を維持する」か「対象を非表示にする」を選んでください。',
  decision_type_unremovable:
    '対象の種類がアカウントか手帳の場合は、非表示にできません。「対象を維持する」を選んでください。',

  staff_email_required: 'メールアドレスを入力してください。',
  staff_email_invalid: 'メールアドレスの形式が正しくありません。',
  staff_self_change:
    '操作者が変更対象の担当者本人のため、ロールの削除や取り消しはできません。ほかの管理者に依頼してください。'
};
