import React, {useEffect, useState} from 'react';

import "./ImagePicker.scss";
import {Image} from "react-bootstrap";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const ImagePicker = ({images, onSelect, width, height, image}) => {

  const [selectedImage, setSelectedImage] = useState({});

  useEffect(() => {
    setSelectedImage(image);
  }, [image]);

  const handleImageClick = image => {
    setSelectedImage(image);
    onSelect(image);
  };

  return (
    <div className="imagePicker-container" style={{width: width, height: height}}>
      {
        images.map(image => <div key={image.value} className={'content'}>
          {
            selectedImage.value === image.value &&
            <FontAwesomeIcon icon={faCheckCircle} className="imagePicker-icon" size="3x"/>
          }
          < Image src={image.src} fluid onClick={() => handleImageClick(image)} className="image"/>
        </div>)
      }
    </div>
  )

};

export default ImagePicker;
