import format from "date-fns/format";
import addDays from "date-fns/addDays";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import distanceInWords from "date-fns/formatDistance";
import compareAsc from "date-fns/compareAsc";
import isWithinInterval from "date-fns/isWithinInterval";
import getHours from "date-fns/getHours";
import getMinutes from "date-fns/getMinutes";

export const formatDate = (date) => {
  return format(new Date(date), "yyyy/MM/dd");
};

export const formatTime = (date) => {
  const dateToFormat = new Date(date);
  return `${getHours(dateToFormat).toString().padStart(2, "0")}:${getMinutes(dateToFormat)
    .toString()
    .padStart(2, "0")}`;
};

export const formatDateFromDataBase = (date) => {
  return format(addDaysToDate(date, 1), "dd/MM/yyyy");
};

export const formatDateToInput = (date) => {
  return format(addDaysToDate(date, 1), "yyyy-MM-dd");
};

export const addDaysToDate = (date, days) => {
  return addDays(new Date(date), days);
};

export const getDaysToDate = (dateStart, dateEnd) => {
  return differenceInCalendarDays(new Date(dateStart), new Date(dateEnd));
};

export const getTimeUntilNowInWords = (date) => {
  return distanceInWords(new Date(date), new Date(), { addSuffix: true });
};

export const compareDateGreaterThan = (startDate, endDate) => {
  const compareStartDate = new Date(startDate).setUTCHours(0, 0, 0, 0);
  const compareEndDate = new Date(endDate).setUTCHours(0, 0, 0, 0);

  if (compareEndDate === compareStartDate) {
    return 1;
  }
  const compareValue = compareAsc(compareStartDate, compareEndDate);
  return compareValue === -1 || compareValue === 0;
};

export const dateBetween = (startDate, endDate, compareDate) => {
  startDate = new Date(startDate).setUTCHours(0, 0, 0, 0);
  endDate = new Date(endDate).setUTCHours(0, 0, 0, 0);
  compareDate = new Date(compareDate).setUTCHours(0, 0, 0, 0);

  return isWithinInterval(compareDate, {
    start: startDate,
    end: endDate
  });
};
