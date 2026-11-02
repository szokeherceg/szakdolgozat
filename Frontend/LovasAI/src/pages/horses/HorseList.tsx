import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import { Button, Image, Input, PageLayout } from "../../components";
import { HorseModel } from "../../models";
import { apiUrl } from "../../utils/api";
import { isInDateRange } from "../../utils/date";

import Trash from "./../../assets/trash.svg";
import Edit from "./../../assets/edit-246.png";
import NotFound from "./../../assets/notfound.png";

import "./horse-list.css";
import "react-datepicker/dist/react-datepicker.css";

const MIN_SEARCH_LENGTH = 3;

export const HorsesList = () => {
  const [horses, setHorses] = useState<HorseModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showNotFound, setShowNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/horse-data/`);

        if (Array.isArray(data)) {
          setHorses(data);
          setShowNotFound(data.length === 0);
        }
      } catch (error) {
        console.error("Error fetching horses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHorses();
  }, []);

  const handleDeleteHorse = async (horse: HorseModel) => {
    try {
      await axios.delete(`${apiUrl}/horse-data/${horse.id}/`);
      setHorses((prevHorses) => prevHorses.filter((h) => h.id !== horse.id));
    } catch (error) {
      console.error("Failed to delete horse:", error);
    }
  };

  const filteredHorses = horses.filter(
    (horse) =>
      (debouncedSearchTerm.length < MIN_SEARCH_LENGTH ||
        horse.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) &&
      isInDateRange(new Date(horse.created_at), startDate, endDate),
  );

  return (
    <PageLayout className="page-layout horse-list-page">
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
              placeholderText={t("datetimeformat")}
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
              placeholderText={t("datetimeformat")}
            />
          </div>
        </div>
      </div>
      {searchTerm.length > 0 && searchTerm.length < MIN_SEARCH_LENGTH && (
        <div className="search-warning">
          {t("minchar", { count: MIN_SEARCH_LENGTH })}
        </div>
      )}

      <ul className="chess">
        {filteredHorses.map((horse) => (
          <li
            key={horse.id}
            className="card"
            onClick={() => navigate(`/HorseDetail/${horse.id}`)}
          >
            <img
              src={`${apiUrl}${horse.image}`}
              alt={horse.name}
              className="card-image"
            />
            <div className="card-content">
              <div className="card-top">
                <h2>{horse.name}</h2>
                <div className="card-buttons">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/EditHorse/${horse.id}`);
                    }}
                  >
                    <Image height="55px" width="55px" src={Edit} />
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHorse(horse);
                    }}
                  >
                    <Image height="45px" width="45px" src={Trash} />
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
        {!loading && showNotFound && filteredHorses.length === 0 && (
          <Image height="200px" width="auto" src={NotFound} />
        )}
      </ul>
    </PageLayout>
  );
};
