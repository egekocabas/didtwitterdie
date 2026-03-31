export interface RankEntry {
  date: string;
  rank: number;
}

export interface PageviewEntry {
  date: string;
  views: number;
}

export interface RadarDomainInfo {
  bucket: string | null;
}

export interface TrancoData {
  twitter: RankEntry[];
  x: RankEntry[];
}

export interface RadarData {
  twitter: RadarDomainInfo;
  x: RadarDomainInfo;
}

export interface RadarServicesData {
  xTwitter: RankEntry[];
  latestRank: number | null;
  category: "Social Media";
  asOf: string | null;
}

export interface UmbrellaData {
  twitter: RankEntry[];
  x: RankEntry[];
  asOf: string | null;
  historyLagDays?: number;
}

export interface MajesticData {
  twitter: RankEntry[];
  x: RankEntry[];
  asOf: string | null;
}

export interface WikipediaData {
  twitter: PageviewEntry[];
  x: PageviewEntry[];
  asOf: string | null;
}

export interface ApiResponse {
  radar: RadarData | null;
  trends: null;
  tranco: TrancoData | null;
  radarServices: RadarServicesData | null;
  umbrella: UmbrellaData | null;
  majestic: MajesticData | null;
  wikipedia: WikipediaData | null;
  updated_at: number;
  errors?: string[];
}

export type TimeRange = "1M" | "6M" | "1Y" | "3Y" | "ALL";
