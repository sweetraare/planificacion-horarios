import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";

import "./StarRating.css";

const StarRatingReadOnly = ({length, size, rate}) => {

  const createStar = (id) => {
    return (
      <span key={id}>
        <FontAwesomeIcon
          icon={faStar}
          size={size}
          className={`${getClass(id)}`}
        />
      </span>
    )
  };

  const getClass = (id) => {
    return id <= rate ? 'rate-colored' : '';
  };

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= length; i++) {
      stars.push(createStar(i));
    }
    return (
      <>
        {stars}
      </>
    )
  };

  return (
    <div>
      {renderStars()}
    </div>
  );
};

export default StarRatingReadOnly;
