export type ApiCursorPage<T> = {
  data: T[];
  next_cursor: string | null;
};
