export interface Company {
  name: string;
  ticker: string;
  country: string;
  products: string;
  sector?: string;
  defensePotential?: string;
  description?: string;
  category?: MaterialCategory;
  defenseUses?: string;
}

export interface StockData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export type MaterialCategory = 'steel' | 'rareEarth' | 'explosives' | 'composites' | 'electronics';