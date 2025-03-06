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
  revenue?: number;
  marketCap?: number;
  euFundFocus?: boolean;
}

export interface NetworkNode extends Company {
  id: string;
  type: 'producer' | 'supplier' | 'material';
  level: number;  // 0 = end producer, 1 = tier 1 supplier, 2 = material provider, etc.
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number; // Strength of dependency from 1-10
  description: string; // Description of the dependency relationship
}

export interface DependencyNetwork {
  nodes: NetworkNode[];
  links: NetworkLink[];
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
  isToday?: boolean;
  preset?: string;
}

export type MaterialCategory = 'steel' | 'rareEarth' | 'explosives' | 'composites' | 'electronics' | 'cybersecurity' | 'missiles' | 'mobility';