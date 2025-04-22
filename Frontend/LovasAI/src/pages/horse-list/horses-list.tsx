import { FormSetUp } from "../../components";
import { useTranslation } from "react-i18next";

import "./horselist.css";
import { useEffect, useState } from "react";
import axios from "axios";

export const HorsesList = () => {
  interface Horse {
    name: string;
    weight: number;
    age: number;
    image: string;
    desc: string;
  }

  const [horses, setHorses] = useState<Horse[]>([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8080/user/horse-data/"
        );
        if (Array.isArray(response.data)) {
          setHorses(response.data);
        } else {
          console.log("Horses fetched:", response.data);
        }
      } catch (error) {
        console.error("Error fetching horses:", error);
      }
    };

    fetchHorses().then(() => {
      console.log("Horses fetched:", horses);
    });
  }, []);

  return (
    <FormSetUp hasModal>
      <h1>{t("myhorses")}</h1>
      <ul className="chess">
        {horses.map((horse, index) => (
          <li key={index} className="card">
            <h2>{horse.name}</h2>
            <p>
              {t("weight")}: {horse.weight}
            </p>
            <p>
              {t("age")}: {horse.age}
            </p>
            <p>
              {t("description")}:
              <br /> {horse.desc}
            </p>
          </li>
        ))}
      </ul>
    </FormSetUp>
  );
};
