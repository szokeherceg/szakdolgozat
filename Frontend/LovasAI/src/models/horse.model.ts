export interface HorseModel {
  id: number;
  name: string;
  chip_number?: string;
  stable_name?: string;
  studbook_number?: string;
  birth_date?: string | null;
  gender?: string | null;
  is_healthy?: boolean;
  color?: string;
  markings?: string;
  branding?: string;
  breeder?: string;
  owner?: string;
  father?: string;
  mother?: string;
  maternal_grandsire?: string;
  breed?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  image?: string | null;
  desc?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MeasurementModel {
  id: number;
  horse: number;
  measured_at: string;
  inserted_at?: string;
  height?: number | null;
  weight?: number | null;
  girth?: number | null;
  cannon_girth?: number | null;
  image?: string | null;
  ai_image?: string | null;
}

export interface AIResponseModel {
  success: boolean;
  height?: number | null;
  image?: string | null;
  error?: string;
}
