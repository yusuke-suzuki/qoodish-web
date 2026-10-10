export const en = {
  error_400: 'Invalid parameter specified.',
  error_401: 'Authentication has failed.',
  error_403: 'Operation not allowed.',
  error_404: 'Resource not found.',
  error_409: 'A conflict has occurred for the requested resource.',
  error_422: 'The request is invalid or malformed.',
  error_429: 'Too many requests. Please try again later.',
  error_500: 'The request has failed due to some unknown error.',
  error_separator: ' ',

  duplicate_map_name: 'Map name is duplicated.',
  map_name_required: 'Map name is required.',
  map_name_exceed: 'Map name is too long. (Max: 30)',
  map_description_required: 'Please enter a description of the map.',
  map_description_exceed: 'Description of the map is too long. (Max: 200)',
  map_author_not_specified: 'Please specify the author of the map.',

  comment_required: 'Comment is required.',
  comment_exceeded: 'Comment is too long. (Max: 500)',
  invalid_uri: 'Invalid URI.',
  images_per_report_reached_limit:
    'The limit of images per report has been reached.',

  coauthor_already_author: 'The author cannot be a coauthor.',
  duplicate_coauthor: 'The user is already a coauthor.',
  bookmark_map_not_public: 'Only public maps can be bookmarked.',
  bookmark_map_editable:
    'The author and coauthors cannot bookmark a map they can edit.',
  duplicate_bookmark: 'The map is already bookmarked.',
  invitation_invitee_already_author:
    'The author cannot be invited as a coauthor.',
  duplicate_pending_invitation:
    'A pending invitation already exists for this user.',

  registration_token_is_required: 'Registration token is required.',
  registration_token_is_duplicated: 'Registration token is duplicated.',

  duplicate_unfinished_journey:
    'An unfinished journey already exists on this map.',
  journey_already_started: 'The journey has already started.',
  journey_not_started: 'The journey has not started yet.',
  journey_already_finished: 'The journey has already finished.',
  journey_not_in_progress: 'The journey is not in progress.',
  journey_encoded_path_exceed: 'The journey path is too large.',
  duplicate_milestone: 'The pin is already added as a milestone.',
  duplicate_checkin: 'The journey has already checked in at this pin.',
  pin_not_on_journey_map: 'The pin does not belong to the map of the journey.',
  images_per_checkin_reached_limit:
    'The limit of images per checkin has been reached.',
  checkin_note_exceeded: 'The note is too long. (Max: 500)',
  checkin_time_outside_journey_period:
    'The checkin time is outside the journey period.',

  chapter_title_required: 'Chapter title is required.',
  chapter_title_exceed: 'Chapter title is too long. (Max: 100)',
  chapter_content_invalid: 'Chapter content is not a valid document.',
  chapter_content_exceed: 'Chapter content is too large.',
  chapter_map_features_invalid:
    'Chapter map features are not a valid GeoJSON FeatureCollection.',
  chapter_map_features_exceed: 'Chapter map features are too large.',
  chapter_journey_mismatch:
    'The journey does not belong to the author or the map of the chapter.',
  duplicate_chapter_for_journey:
    'A chapter has already been created for this journey.',

  pin_property_name_required: 'Tag name is required.',
  pin_property_name_exceed: 'Tag name is too long. (Max: 30)',
  pin_property_option_name_required: 'Option name is required.',
  pin_property_option_name_exceed: 'Option name is too long. (Max: 30)',

  journal_title_required: 'Journal title is required.',
  journal_title_exceed: 'Journal title is too long. (Max: 50)',
  journal_description_exceed: 'Journal description is too long. (Max: 200)',
  journal_bookmark_own: 'The author cannot bookmark their own journal.',
  duplicate_journal_bookmark: 'The journal is already bookmarked.',

  report_type_not_supported: 'This content cannot be reported.'
};

export type Messages = typeof en;

export type MessageKey = keyof Messages;
