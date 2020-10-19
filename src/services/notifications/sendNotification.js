import axios from "axios";

export const sendNotification = (notification) => {
  const data = {
    app_id: process.env.REACT_APP_ONESIGNAL_APP_ID,
    included_segments: ["All"],
    data: notification.data,
    contents: notification.contents,
    headings: notification.headings,
    content_available: true,
    big_picture: notification.picture
  };

  if (notification.date) {
    data.send_after = notification.date;
    data.delayed_option = "timezone";
    data.delivery_time_of_day = notification.time;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${process.env.REACT_APP_ONESIGNAL_AUTHORIZATION}`
  };

  return axios.post(process.env.REACT_APP_ONESIGNAL_CREATE_URI, data, {
    headers: headers
  });
};

export const sendNotificationToUser = (notification) => {
  const data = {
    app_id: process.env.REACT_APP_ONESIGNAL_APP_ID,
    data: notification.data,
    include_player_ids: notification.notificationsId,
    contents: notification.contents,
    headings: notification.headings,
    content_available: true
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${process.env.REACT_APP_ONESIGNAL_AUTHORIZATION}`
  };

  return axios.post(process.env.REACT_APP_ONESIGNAL_CREATE_URI, data, {
    headers: headers
  });
};
