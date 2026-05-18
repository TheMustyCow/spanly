export interface SubRange {
  id: string;
  label: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface SeasonRange {
  id: string;
  name: string;
  ranges: SubRange[];
  category: string;
  color: string;
  enabled: boolean;
}
