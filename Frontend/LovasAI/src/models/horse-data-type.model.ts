export type HorseDataTypeModel = {
  name: string;
  gender?: string | null;
  breed?: string | null;
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  desc?: string;
  image: FileList;
};
