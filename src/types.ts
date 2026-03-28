export interface RankEntry {
  date: string;
  rank: number;
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

export interface ApiResponse {
  radar: RadarData | null;
  trends: null;
  tranco: TrancoData | null;
  updated_at: number;
  errors?: string[];
}

export type TimeRange = "1M" | "6M" | "1Y" | "3Y" | "ALL";
