import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faStar} from "@fortawesome/free-solid-svg-icons";

import "./StarRating.css";

const StarRating = ({lenght, size, handleSelectedStar, rate, isValidRate}) => {
  const [selectedStar, setSelectedStar] = useState(rate);

  useEffect(() => {
    setSelectedStar(rate);
  }, [rate]);

  const createStar = (id) => {
    return (
      <span key={id}>
        <FontAwesomeIcon
          icon={faStar}
          size={size}
          className={`rate ${getClass(id)}`}
          onClick={() => handleClick(id)}
        />
      </span>
    )
  };

  const getClass = (id) => {

    if (isValidRate) {
      return id <= selectedStar ? 'rate-colored' : '';
    } else {
      return '';
    }

  };

  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= lenght; i++) {
      stars.push(createStar(i));
    }
    return (
      <>
        {stars}
      </>
    )
  };

  const handleClick = (id) => {
    setSelectedStar(id);
    handleSelectedStar(id);
  };

  return (
    <div>
      {renderStars()}
    </div>
  );
};

export default StarRating;
