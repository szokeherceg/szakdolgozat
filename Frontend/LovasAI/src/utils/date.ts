export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseDate = (value: string) =>
  new Date(`${value.slice(0, 10)}T00:00:00`);

export const isInDateRange = (
  date: Date,
  start?: Date | null,
  end?: Date | null,
) => {
  const startOfDay = start
    ? new Date(start.getFullYear(), start.getMonth(), start.getDate())
    : null;

  const endOfDay = end
    ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
    : null;

  return !(startOfDay && date < startOfDay) && !(endOfDay && date > endOfDay);
};
