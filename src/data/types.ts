export type Block = 0 | 1 | 2 | 3 | 4;

export type Question = {
  id: string;
  topic: string;
  block: Block;
  text: string;
  options: string[];
  answer: number;
  why: string;
  hook: string;
  rule: string;
};

export type Chapter = {
  slug: string;
  title: string;
  km: string;
  minutes: number;
  scene: string;
  rule: string;
  hook: string;
  trap: string;
  points: string[];
  ref: string;
};

export type SignGroup =
  | "Предупреждающие"
  | "Приоритет"
  | "Запрещающие"
  | "Предписывающие"
  | "Особые";

export type SignInfo = {
  id: string;
  code: string;
  name: string;
  group: SignGroup;
  meaning: string;
  action: string;
  trap: string;
};

export type Situation = {
  id: string;
  title: string;
  scene: string;
  prompt: string;
  options: string[];
  answer: number;
  why: string;
  hook: string;
  rule: string;
};

export type NewsItem = {
  date: string;
  title: string;
  text: string;
};
