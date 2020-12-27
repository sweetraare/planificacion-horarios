export const INITIAL_HOUR = 7;
export const FINAL_HOUR = 20;

export const CARD_COLORS = ["#000000", "#006EA8", "#926F14", "#666666"];

export const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "profesor", label: "Profesor" },
];

export const STAR_RATING_LENGTH = 5;

export const DEFAULT_SCHEDULE = [
  {
    startDateTime: "2020-03-02T08:00:00.000Z",
    endDateTime: "2020-03-02T19:00:00.000Z",
  }, // Monday
  {
    startDateTime: "2020-03-03T08:00:00.000Z",
    endDateTime: "2020-03-03T19:00:00.000Z",
  }, // Tuesday
  {
    startDateTime: "2020-03-04T08:00:00.000Z",
    endDateTime: "2020-03-04T19:00:00.000Z",
  }, // Wednesday
  {
    startDateTime: "2020-03-05T08:00:00.000Z",
    endDateTime: "2020-03-05T19:00:00.000Z",
  }, // Thursday
  {
    startDateTime: "2020-03-06T08:00:00.000Z",
    endDateTime: "2020-03-06T19:00:00.000Z",
  }, // Friday
  {
    startDateTime: "2020-03-07T08:00:00.000Z",
    endDateTime: "2020-03-07T18:00:00.000Z",
  }, // Saturday
];

export const DAY_NAME = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const SERVICE_HOURS = [
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
];

export const TOOLTIP_DATA_KEY = {
  waiting: {
    label: "Plan Waiting",
    color: "#495D6A",
  },
  inProgress: {
    label: "Plan In Progress",
    color: "#050533",
  },
  done: {
    label: "Plan Finished",
    color: "#5AC69F",
  },
  EXTRAwaiting: {
    label: "Extra Waiting",
    color: "#8CA2B0",
  },
  EXTRAinProgress: {
    label: "Extra In Progress",
    color: "#2F6D80",
  },
  EXTRAdone: {
    label: "Extra Finished",
    color: "#267055",
  },
};

export const REFUND_REASONS = [
  "Wrong car size",
  "Client does not want plan anymore",
  "Something else",
];
