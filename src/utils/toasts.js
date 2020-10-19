import {toast} from "react-toastify";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faExclamationTriangle, faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons/faTimesCircle";

export const newSuccessToast = (message) => {
  const SuccessMessage = () => (
    <div>
      <FontAwesomeIcon icon={faCheckCircle}/>
      <span className="ml-2">
        {message}
      </span>

    </div>
  );
  return toast.success(<SuccessMessage/>);
};

export const newErrorToast = (message) => {
  const ErrorMessage = () => (
    <div>
      <FontAwesomeIcon icon={faTimesCircle}/>
      <span className="ml-2">
        {message}
      </span>

    </div>
  );
  return toast.error(<ErrorMessage/>);
};

export const newWarningToast = (message) => {
  const WarningMessage = () => (
    <div>
      <FontAwesomeIcon icon={faExclamationTriangle}/>
      <span className="ml-2">
        {message}
      </span>

    </div>
  );
  return toast.warn(<WarningMessage/>);
};

export const newInformationToast = (message) => {
  const InfoMessage = () => (
    <div>
      <FontAwesomeIcon icon={faInfoCircle}/>
      <span className="ml-2">
        {message}
      </span>

    </div>
  );
  return toast.info(<InfoMessage/>);
};

export const newDefaultToast = (message) => {
  return toast(message);
};
