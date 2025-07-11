import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import { Button, FormSetUp, Header, Image, Input } from "../../components";
import { Modal } from "../modal/Modal";
import { useNavigate } from "react-router-dom";
import { DataNameModel, HorseModel } from "../../models";

import Trash from "./../../assets/trash.svg";
import AI from "./../../assets/ai.svg";
import Edit from "./../../assets/edit-246.png";
import NotFound from "./../../assets/notfound.png";

import "./horselist.css";
import "react-datepicker/dist/react-datepicker.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const HorsesList = () => {
  const [horses, setHorses] = useState<HorseModel[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const { t } = useTranslation();
  const [isHorseDetails, setHorseDetails] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<HorseModel | null>(null);
  const navigate = useNavigate();

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const token =
          localStorage.getItem(DataNameModel.ACCESS_TOKEN) ||
          localStorage.getItem(DataNameModel.REFRESH_TOKEN);
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get(`${apiUrl}/horse-data/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setHorses(response.data);
        } else {
          console.log("Horses fetched:", response.data);
        }
      } catch (error) {
        console.error("Error fetching horses:", error);
      }
    };

    fetchHorses();
  }, []);

  const handleDeleteHorse = async (horse: HorseModel) => {
    try {
      const token =
        localStorage.getItem(DataNameModel.ACCESS_TOKEN) ||
        localStorage.getItem(DataNameModel.REFRESH_TOKEN);
      if (!token) {
        console.error("No token found");
        return;
      }

      await axios.delete(`${apiUrl}/horse-data/${horse.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHorses((prevHorses) => prevHorses.filter((h) => h.id !== horse.id));
    } catch (error) {
      console.error("Failed to delete horse:", error);
    }
  };

  const handleHorseClick = (horse: HorseModel) => {
    setSelectedHorse(horse);
    setHorseDetails(true);
  };

  const filteredHorses = horses.filter((horse) => {
    if (
      debouncedSearchTerm.length >= 3 &&
      !horse.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ) {
      return false;
    }

    const createdDate = new Date(horse.created_at);

    const startYMD = startDate
      ? new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        )
      : null;

    const endDateEndOfDay = endDate
      ? new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          23,
          59,
          59,
          999
        )
      : null;

    if (startYMD && createdDate < startYMD) {
      return false;
    }

    if (endDateEndOfDay && createdDate > endDateEndOfDay) {
      return false;
    }
    return true;
  });

  return (
    <>
      <Header />
      <FormSetUp hasModal>
        <div className="list-header">
          <div className="horse-list-header">
            <h1>{t("myhorses")}</h1>
            <div className="new-horse">
              <Button type="submit" onClick={() => navigate("/AddHorse")}>
                {t("addhorse")}
              </Button>
            </div>
          </div>

          <div className="search-container">
            <div className="search-input">
              <label htmlFor="search">{t("search")}</label>
              <Input
                type="search"
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="search-input">
              <label htmlFor="startDate">{t("startdate")}</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date || undefined)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                placeholderText={"éééé.hh.nn."}
              />
            </div>
            <div className="search-input">
              <label htmlFor="endDate">{t("enddate")}</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date || undefined)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="yyyy-MM-dd"
                placeholderText={"éééé.hh.nn."}
              />
            </div>
          </div>
        </div>
        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className="search-warning">{t("minchar", { count: 3 })}</div>
        )}

        <ul className="chess">
          {filteredHorses.map((horse, index) => (
            <li
              key={index}
              className="card"
              onClick={() => handleHorseClick(horse)}
            >
              <img
                src={`${apiUrl}${horse.image}`}
                alt={horse.name}
                className="card-image"
              />
              <div className="card-content">
                <div className="card-text">
                  <div className="card-top">
                    <h2>{horse.name}</h2>
                    <div className="card-buttons">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/EditHorse/${horse.id}`);
                        }}
                      >
                        <Image height="50px" width="50px" src={Edit} />
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHorse(horse);
                        }}
                      >
                        <Image height="50px" width="50px" src={Trash} />
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/AI");
                        }}
                      >
                        <Image height="50px" width="50px" src={AI} />
                      </div>
                    </div>
                  </div>
                  {horse.weight !== null && (
                    <p>
                      {t("weight")}: {horse.weight}
                    </p>
                  )}
                  {horse.age !== null && (
                    <p>
                      {t("age")}: {horse.age}
                    </p>
                  )}
                  {horse.desc !== "" && (
                    <p>
                      {t("description")}:{" "}
                      <span>
                        {horse.desc.length > 100
                          ? horse.desc.substring(0, 100) + "..."
                          : horse.desc}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
          {filteredHorses.length === 0 && (
            <Image height="200px" width="auto" src={NotFound} />
          )}
        </ul>
      </FormSetUp>

      {selectedHorse && (
        <Modal isOpen={isHorseDetails} onClose={() => setHorseDetails(false)}>
          <div className="horse-details">
            <h2>{selectedHorse.name}</h2>
            {selectedHorse.weight !== null && (
              <p>
                {t(DataNameModel.HORSE_WEIGHT)}: {selectedHorse.weight}
              </p>
            )}
            {selectedHorse.age !== null && (
              <p>
                {t(DataNameModel.HORSE_AGE)}: {selectedHorse.age}
              </p>
            )}
            {selectedHorse.desc !== "" && (
              <p>
                {t(DataNameModel.HORSE_DESC)}:{" "}
                <span>
                  {selectedHorse.desc.length > 100
                    ? selectedHorse.desc.substring(0, 100) + "..."
                    : selectedHorse.desc}
                </span>
              </p>
            )}
            <img
              src={`${apiUrl}${selectedHorse.image}`}
              alt={selectedHorse.name}
              className="modal-image"
            />
          </div>
        </Modal>
      )}
    </>
  );
};
