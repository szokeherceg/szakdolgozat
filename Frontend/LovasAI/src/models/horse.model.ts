export interface HorseModel {
  id: number;
  name: string;
  weight: number;
  age: number;
  image: string;
  desc: string;
  created_at: string;
  updated_at: string;
  breed?: string | null;
  gender?: string | null;
  video?: string | null;
}
