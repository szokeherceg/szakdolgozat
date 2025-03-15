import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, Button, FormSetUp } from "../components";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Érvényes e-mail címet adj meg!")
    .required("Az e-mail megadása kötelező!"),
  password: yup
    .string()
    .min(6, "Minimum 6 karakter hosszú legyen!")
    .required("A jelszó megadása kötelező!"),
  language: yup.string().required("Válassz egy nyelvet!"),
});

type FormValues = {
  email: string;
  password: string;
  language: string;
};

export const Settings = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form data:", data);
    alert("Form sikeresen elküldve!");
  };

  return (
    <FormSetUp onSubmit={handleSubmit(onSubmit)} className="settings" hasModal>
      <h2 className="text-2xl font-semibold text-center text-gray-700">
        Beállítások
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-600">
          E-mail cím
        </label>
        <Input
          type="email"
          {...register("email")}
          placeholder="pelda@email.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}

        <label className="block text-sm font-medium text-gray-600">
          Jelszó
        </label>
        <Input
          type="password"
          {...register("password")}
          placeholder="********"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}

        <label className="block text-sm font-medium text-gray-600">Nyelv</label>
        <select
          {...register("language")}
          className="w-full p-2 border rounded-lg mt-1"
        >
          <option value="">Válassz nyelvet</option>
          <option value="hu">Magyar</option>
          <option value="en">Angol</option>
        </select>
        {errors.language && (
          <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>
        )}
      </div>

      <Button type="submit">Küldés</Button>
    </FormSetUp>
  );
};
