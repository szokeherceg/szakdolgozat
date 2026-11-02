import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import DatePicker from "react-datepicker";
import { Button, Image, PageLayout } from "../../components";
import { DataNameModel, HorseModel, MeasurementModel } from "../../models";
import { apiUrl, getMediaUrl } from "../../utils/api";
import { isInDateRange } from "../../utils/date";

import Trash from "./../../assets/trash.svg";
import AI from "./../../assets/AI.svg";
import Edit from "./../../assets/edit-246.png";
import NotFound from "../../assets/notfound.png";

import "react-datepicker/dist/react-datepicker.css";
import "./horse-detail.css";

export const HorseDetail = () => {
  const [showAllData, setShowAllData] = useState(false);
  const [horse, setHorse] = useState<HorseModel | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [measurementsError, setMeasurementsError] = useState(false);

  const { id } = useParams<{ id: string }>();
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

      try {
        const response = await axios.get(`${apiUrl}/horse-data/${id}/`);
        setHorse(response.data);
      } catch (error) {
        console.error("Failed to fetch horse data:", error);
        setHorse(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${apiUrl}/horse-data/${id}/measurements/`,
        );

        setMeasurements(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
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

    void fetchData();
  }, [id]);

  const filteredMeasurements = useMemo(
    () =>
      measurements.filter((measurement) => {
        const measuredDate = new Date(measurement.measured_at);

        return (
          !Number.isNaN(measuredDate.getTime()) &&
          isInDateRange(measuredDate, startDate, endDate)
        );
      }),
    [measurements, startDate, endDate],
  );

  const showField = (label: string, value?: string | number | null) =>
    value !== undefined && value !== null && value !== "" ? (
      <p key={label}>
        <div>{label}:</div> {value}
      </p>
    ) : null;

  const handleDeleteMeasurement = async (measurementId: number) => {
    try {
      await axios.delete(`${apiUrl}/measurements/${measurementId}/`);

      setMeasurements((previous) =>
        previous.filter((measurement) => measurement.id !== measurementId),
      );
    } catch (error) {
      console.error("Failed to delete measurement:", error);
    }
  };

  return (
    <PageLayout className="page-layout horse-detail-page" isLoading={loading}>
      {!horse ? (
        <Button type="button" onClick={() => navigate("/HorsesList")}>
          {t("back")}
        </Button>
      ) : (
        <div className="horse-details">
          <div className="horse-info">
            {horse.image && (
              <img
                src={getMediaUrl(horse.image)}
                alt={horse.name}
                className="modal-image"
              />
            )}

            <section className="info-details">
              <h2 className="horse-name">{horse.name}</h2>

              {showField(t("stable_name"), horse.stable_name)}
              {showField(t("chip_number"), horse.chip_number)}
              {showField(
                t("healthy"),
                horse.is_healthy !== undefined
                  ? horse.is_healthy
                    ? t("yes")
                    : t("no")
                  : null,
              )}
              {showAllData && (
                <>
                  {showField(t("studbook_number"), horse.studbook_number)}
                  {showField(
                    t("birth_date"),
                    horse.birth_date
                      ? new Date(horse.birth_date).toLocaleDateString()
                      : null,
                  )}
                  {showField(t("gender"), horse.gender ? t(horse.gender) : null)}
                  {showField(t(DataNameModel.HORSE_BREED), horse.breed)}
                  {showField(t(DataNameModel.HORSE_AGE), horse.age)}
                  {showField(t("color"), horse.color ? t(horse.color) : null)}
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
                  onClick={() => setShowAllData((previous) => !previous)}
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
              <h2>{t("page_measurements")}</h2>
              <Button
                type="button"
                onClick={() => navigate(`/AddMeasurement/${horse.id}`)}
              >
                {t("add_measurement")}
              </Button>
            </div>

            <div className="measurement-search-container">
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
                  isClearable
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
                  isClearable
                />
              </div>
            </div>

            {measurementsError ? (
              <Image height="200px" width="auto" src={NotFound} />
            ) : filteredMeasurements.length > 0 ? (
              <ul className="chess measurement-cards">
                {filteredMeasurements.map((measurement) => (
                  <li
                    key={measurement.id}
                    className="card measurement-list-card"
                  >
                    {measurement.image && (
                      <img
                        src={getMediaUrl(measurement.image)}
                        alt={t("measurement_image")}
                        className="card-image measurement-card-image"
                        loading="lazy"
                      />
                    )}

                    <div className="card-content">
                      <div className="card-top">
                        <h2 className="measurement-card-date">
                          {new Date(
                            measurement.measured_at,
                          ).toLocaleDateString()}
                        </h2>

                        <div className="card-buttons">
                          <button
                            type="button"
                            className="measurement-icon-button"
                            onClick={() =>
                              navigate(`/EditMeasurement/${measurement.id}`)
                            }
                            aria-label={t("edit")}
                            title={t("edit")}
                          >
                            <Image height="48px" width="48px" src={Edit} />
                          </button>

                          <button
                            type="button"
                            className="measurement-icon-button"
                            onClick={() =>
                              void handleDeleteMeasurement(measurement.id)
                            }
                            aria-label={t("delete")}
                            title={t("delete")}
                          >
                            <Image height="40px" width="40px" src={Trash} />
                          </button>

                          <button
                            type="button"
                            className="measurement-icon-button"
                            onClick={() =>
                              navigate(
                                `/AI/${measurement.horse}?measurementId=${measurement.id}`,
                              )
                            }
                          >
                            <Image height="48px" width="48px" src={AI} />
                          </button>
                        </div>
                      </div>

                      <div className="measurement-values">
                        {showField(t("height"), measurement.height)}
                        {showField(t("weight"), measurement.weight)}
                        {showField(t("girth"), measurement.girth)}
                        {showField(t("cannon_girth"), measurement.cannon_girth)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Image height="200px" width="400px" src={NotFound} />
            )}
          </section>

          <div className="details-button">
            <Button type="button" onClick={() => navigate("/HorsesList")}>
              {t("back")}
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
