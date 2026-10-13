// Shared building blocks for the legal pages (Privacy Policy, Terms of Use).

/** Fill these in before the public launch. Used on both legal pages. */
export const GRIEVANCE_OFFICER = {
  name: "[Grievance Officer's full name]",
  email: "[contact email address]",
  city: "[City]",
};

/** A list item: plain text, or a short bold label followed by text. */
export type Item = string | { label: string; text: string };

/** A numbered clause, e.g. "4.1", with optional (a), (b), (c) items under it. */
export type Clause = { n: string; text: string; items?: Item[] };

export type Block =
  | { p: string }
  | { h3: string }
  | { list: Item[] } // bullet points
  | { lettered: Item[] } // (a), (b), (c)… in English; (அ), (ஆ), (இ)… in Tamil
  | { clauses: Clause[] }; // 4.1, 4.2…

export type Section = { id: string; title: string; blocks: Block[] };

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  contentsTitle: string;
  intro: Block[];
  sections: Section[];
};
