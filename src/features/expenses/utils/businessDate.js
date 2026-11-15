// All accounting dates use the Cairo business day, which starts at 03:00.
const getCairoBusinessDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  const businessDate = new Date(Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day)
  ));

  if (Number(values.hour) < 3) {
    businessDate.setUTCDate(businessDate.getUTCDate() - 1);
  }

  return [
    businessDate.getUTCFullYear(),
    String(businessDate.getUTCMonth() + 1).padStart(2, "0"),
    String(businessDate.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

export const getTodayBusinessDate = () => getCairoBusinessDate(new Date());

export const getRecordBusinessDate = (record) => {
  if (typeof record?.businessDate === "string" && record.businessDate.trim()) {
    return record.businessDate;
  }

  const value = record?.createdAt;
  const date = value?.toDate
    ? value.toDate()
    : value?.seconds
      ? new Date(value.seconds * 1000)
      : value
        ? new Date(value)
        : null;

  return date ? getCairoBusinessDate(date) : "";
};

export const isValidBusinessDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  return value <= getTodayBusinessDate();
};

export const matchesBusinessDateRange = (record, fromDate, toDate) => {
  if (!fromDate && !toDate) return true;

  const dateKey = getRecordBusinessDate(record);
  if (!dateKey) return false;

  return (!fromDate || dateKey >= fromDate) && (!toDate || dateKey <= toDate);
};
