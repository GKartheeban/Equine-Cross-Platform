// An error whose text lives in messages/en.json and ta.json (namespace "sell.errors"),
// so the page can show it in the visitor's language.

export type MessageValues = Record<string, string | number>;

export class AppError extends Error {
  constructor(
    public key: string,
    public values?: MessageValues,
  ) {
    super(key);
  }
}

/** Progress updates are message keys too (namespace "sell.progress") */
export type ProgressFn = (key: string, values?: MessageValues) => void;
