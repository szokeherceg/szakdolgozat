import { FormSetUp, Header } from "../../components";
import { useTranslation } from "react-i18next";
import { Modal } from "../modal/modal";

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
  const { t } = useTranslation();
  const [isHorseDetails, setHorseDetails] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);

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

  const handleHorseClick = (horse: Horse) => {
    setSelectedHorse(horse);
    setHorseDetails(true);
  };

  return (
    <>
      <Header />
      <FormSetUp hasModal>
        <h1>{t("myhorses")}</h1>
        <ul className="chess">
          {horses.map((horse, index) => (
            <li
              key={index}
              className="card"
              onClick={() => handleHorseClick(horse)}
            >
              <h2>{horse.name}</h2>
              <p>
                {t("weight")}: {horse.weight}
              </p>
              <p>
                {t("age")}: {horse.age}
              </p>
              <p>
                {t("description")}:
                <p>
                  {horse.desc.length > 100
                    ? horse.desc.substring(0, 100) + "..."
                    : horse.desc}
                </p>
              </p>
              <img
                src={`http://127.0.0.1:8080/user${horse.image}`}
                alt={horse.name}
                className="card-image"
              />
            </li>
          ))}
        </ul>
        {selectedHorse && (
          <Modal isOpen={isHorseDetails} onClose={() => setHorseDetails(false)}>
            <div className="horse-details">
              <h2>{selectedHorse.name}</h2>
              <p>
                {t("weight")}: {selectedHorse.weight}
              </p>
              <p>
                {t("age")}: {selectedHorse.age}
              </p>
              <p>
                {t("description")}: {selectedHorse.desc}
              </p>
              <img
                src={`http://127.0.0.1:8080/user${selectedHorse.image}`}
                alt={selectedHorse.name}
                className="card-image"
              />
            </div>
          </Modal>
        )}
      </FormSetUp>
    </>
  );
};
