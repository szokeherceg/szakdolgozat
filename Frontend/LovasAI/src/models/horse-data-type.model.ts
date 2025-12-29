export type HorseDataTypeModel = {
  name: string;
  gender?: string | null;
  breed?: string | null;
  weight?: number | null;
  age?: number | null;
  desc?: string;
  image: FileList;
};
