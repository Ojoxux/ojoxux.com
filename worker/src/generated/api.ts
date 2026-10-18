// このファイルは shared/gen/GenTs.hs が生成する。直接編集しない（scripts/gen-types.sh で再生成）。

export type WakaTimeLanguage = IWakaTimeLanguage;

export interface IWakaTimeLanguage {
  name: string;
  text: string;
  percent: number;
}

export type WakaTimeActivity = IWakaTimeActivity;

export interface IWakaTimeActivity {
  rangeText: string;
  totalText: string;
  languages: WakaTimeLanguage[];
}

export type BlogPost = IBlogPost;

export interface IBlogPost {
  title: string;
  link: string;
  pubDate: string;
  thumbnail?: string;
}

export type VisitResult = IVisitResult;

export interface IVisitResult {
  count: number;
}
