import { useForm } from "react-hook-form";
import { FormSetUp, Input, Button } from "../components";

type HorseFormData = {
  name: string;
  weight: number;
  age: number;
  height: number;
  image: FileList;
};

export const AI = () => {
  const { register, handleSubmit, reset } = useForm<HorseFormData>();

  const onSubmit = (data: HorseFormData) => {
    console.log("Beküldött ló adatok:", data);
    reset();
  };

  return (
    <FormSetUp onSubmit={handleSubmit(onSubmit)} hasModal>
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Adatok megadása
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Ló neve:</label>
        <Input type="text" {...register("name", { required: true })} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 font-semibold">
            Súly (kg):
          </label>
          <Input
            type="number"
            {...register("weight", { required: true, min: 1 })}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Kor (év):</label>
          <Input
            type="number"
            {...register("age", { required: true, min: 0 })}
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">
          Marmagasság (cm):
        </label>
        <Input
          type="number"
          {...register("height", { required: true, min: 50 })}
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold">
          Kép feltöltése:
        </label>
        <Input
          type="file"
          accept="image/*"
          {...register("image", { required: true })}
        />
      </div>
      <Button type="submit">Mentés</Button>
    </FormSetUp>
  );
};
