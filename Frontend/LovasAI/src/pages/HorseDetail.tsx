import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import DatePicker from "react-datepicker";
import { Button, FormSetUp, Header,Image } from "../components";
import { DataNameModel } from "../models";
import Load from "./../assets/load.svg";
import NotFound from "../assets/notfound.png";
import "react-datepicker/dist/react-datepicker.css";
import "./list.css";
import "./horsedetails.css";

interface Horse {
  id: number;
  name: string;
  chip_number?: string;
  stable_name?: string;
  studbook_number?: string;
  birth_date?: string | null;
  gender?: string;
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
  image?: string | null;
  desc?: string | null;
}

interface HorseMeasurement {
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

export const HorseDetail = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAllData, setShowAllData] = useState(false);
  const [horse, setHorse] = useState<Horse | null>(null);
  const [measurements, setMeasurements] = useState<HorseMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [measurementSearch, setMeasurementSearch] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [measurementsError, setMeasurementsError] = useState(false);

  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_BASE_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setHorse(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHorse(null);
      setMeasurements([]);
      setMeasurementsError(false);

      const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        const horseResponse = await axios.get(
          `${apiUrl}/horse-data/${id}/`,
          config,
        );

        setHorse(horseResponse.data);
      } catch (error) {
        console.error("Failed to fetch horse data:", error);
        setHorse(null);
        setLoading(false);
        return;
      }

      try {
        const measurementsResponse = await axios.get(
          `${apiUrl}/horse-data/${id}/measurements/`,
          config,
        );

        setMeasurements(
          Array.isArray(measurementsResponse.data)
            ? measurementsResponse.data
            : [],
        );
      } catch (error) {
        console.error("Failed to fetch measurements:", error);
        setMeasurementsError(true);
        setMeasurements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, apiUrl]);

  const filteredMeasurements = useMemo(() => {
    return measurements.filter((measurement) => {
      const search = measurementSearch.trim().toLowerCase();

      const matchesSearch =
        !search ||
        [
          measurement.measured_at,
          measurement.height,
          measurement.weight,
          measurement.girth,
          measurement.cannon_girth,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(search),
        );

      const measuredDate = new Date(measurement.measured_at);

      const start = startDate
        ? new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
          )
        : null;

      const end = endDate
        ? new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            23,
            59,
            59,
            999,
          )
        : null;

      return (
        matchesSearch &&
        (!start || measuredDate >= start) &&
        (!end || measuredDate <= end)
      );
    });
  }, [measurements, measurementSearch, startDate, endDate]);

  const showField = (label: string, value?: string | number | null) =>
    value !== undefined && value !== null && value !== "" ? (
      <p key={label}>
        {label}: {value}
      </p>
    ) : null;

  if (loading) {
    return (
      <div className="loader-container">
        <img src={Load} alt="Loading..." className="loading-image" />
      </div>
    );
  }

  if (!horse) {
    return (
      <>
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <FormSetUp
          className={`page-layout horse-list-page  ${
            isSidebarOpen ? "form-shifted" : "form-centered"
          }`}
        >
          <Button type="button" onClick={() => navigate("/HorsesList")}>
            {t("back")}
          </Button>
        </FormSetUp>
      </>
    );
  }

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <FormSetUp
        className={`page-layout horse-detail-page ${
          isSidebarOpen ? "form-shifted" : "form-centered"
        }`}
      >
        <div className="horse-details">
          <div className="horse-info">
            {horse.image && (
              <img
                src={`${apiUrl}${horse.image}`}
                alt={horse.name}
                className="modal-image"
              />
            )}

            <section className="info-details">
              <h2 className="horse-name">{horse.name}</h2>

              {showField(t("stable_name"), horse.stable_name)}
              {showField(t("chip_number"), horse.chip_number)}

              {showAllData && (
                <>
                  {showField(t("studbook_number"), horse.studbook_number)}
                  {showField(
                    t("birth_date"),
                    horse.birth_date
                      ? new Date(horse.birth_date).toLocaleDateString()
                      : null,
                  )}
                  {showField(
                    t(DataNameModel.HORSE_GENDER),
                    horse.gender ? t(horse.gender) : null,
                  )}
                  {showField(t(DataNameModel.HORSE_BREED), horse.breed)}
                  {showField(t(DataNameModel.HORSE_AGE), horse.age)}
                  {showField(t("color"), horse.color)}
                  {showField(t("markings"), horse.markings)}
                  {showField(t("branding"), horse.branding)}
                  {showField(t("breeder"), horse.breeder)}
                  {showField(t("owner"), horse.owner)}
                  {showField(t("father"), horse.father)}
                  {showField(t("mother"), horse.mother)}
                  {showField(t("maternal_grandsire"), horse.maternal_grandsire)}
                  {showField(t(DataNameModel.HORSE_DESC), horse.desc)}
                </>
              )}

              <div className="details-expand">
                <Button
                  type="button"
                  onClick={() => setShowAllData((prev) => !prev)}
                  aria-expanded={showAllData}
                  aria-label={showAllData ? t("show_less") : t("show_more")}
                >
                  {showAllData ? t("show_less") : t("show_more")}
                </Button>
              </div>
            </section>
          </div>

          <section className="measurements-section">
            <div className="measurements-header">
              <h2>{t("measurements")}</h2>
              <Button
                type="button"
                onClick={() => navigate(`/AddMeasurement/${horse.id}`)}
              >
                {t("add_measurement")}
              </Button>
            </div>

            <div className="measurement-search-container">
              <div className="search-input">
                <label htmlFor="measurement-search">{t("search")}</label>
                <input
                  id="measurement-search"
                  type="search"
                  value={measurementSearch}
                  onChange={(event) => setMeasurementSearch(event.target.value)}
                  placeholder={t("search")}
                />
              </div>

              <div className="search-input">
                <label htmlFor="measurement-start-date">{t("startdate")}</label>
                <DatePicker
                  id="measurement-start-date"
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate ?? undefined}
                  endDate={endDate ?? undefined}
                  dateFormat="yyyy-MM-dd"
                  placeholderText={t("datetimeformat")}
                />
              </div>

              <div className="search-input">
                <label htmlFor="measurement-end-date">{t("enddate")}</label>
                <DatePicker
                  id="measurement-end-date"
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate ?? undefined}
                  endDate={endDate ?? undefined}
                  minDate={startDate ?? undefined}
                  dateFormat="yyyy-MM-dd"
                  placeholderText={t("datetimeformat")}
                />
              </div>
            </div>

            {measurementsError ? (
              <Image height="200px" width="500px" src={NotFound} />
            ) : filteredMeasurements.length > 0 ? (
              <ul className="measurements-list">
                {filteredMeasurements.map((measurement) => (
                  <li key={measurement.id} className="measurement-card">
                    <h3>
                      {new Date(measurement.measured_at).toLocaleDateString()}
                    </h3>

                    {showField(t("horse_height"), measurement.height)}
                    {showField(t("horse_weight"), measurement.weight)}
                    {showField(t("girth"), measurement.girth)}
                    {showField(t("cannon_girth"), measurement.cannon_girth)}

                    {measurement.image && (
                      <img
                        src={`${apiUrl}${measurement.image}`}
                        alt={t("measurement_image")}
                        className="measurement-image"
                      />
                    )}

                    {measurement.ai_image && (
                      <img
                        src={`${apiUrl}${measurement.ai_image}`}
                        alt={t("ai_result")}
                        className="measurement-image"
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("no_measurements_found")}</p>
            )}
          </section>

          <div className="details-button">
            <Button type="button" onClick={() => navigate("/HorsesList")}>
              {t("back")}
            </Button>
          </div>
        </div>
      </FormSetUp>
    </>
  );
};
