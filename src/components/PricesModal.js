import React, {useEffect, useState} from "react";
import {Button, Col, Form, FormControl, InputGroup, Modal, Row} from "react-bootstrap";
import {newErrorToast} from "../utils/toasts";
import {getCarSizes} from "../services/firebase/operations/carSizes";
import toArray from "lodash/toArray";

export default ({show, itemToEdit, handleClose, handleSaveItem}) => {

  const [carSizes, setCarSizes] = useState([]);
  const [carSizesActive, setCarSizesActive] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const carSizesResponse = await getCarSizes();

        if (carSizesResponse.exists()) {
          return carSizesResponse.val()
        }
      } catch (error) {
        return error;
      }
    };

    fetchData()
      .then(data => {
        if (data) {
          setCarSizes(toArray(data));
        }
      })
      .catch(error => newErrorToast(`Error: ${error.message}`));

  }, []);

  useEffect(() => {
    setCarSizesActive(itemToEdit.prices ? itemToEdit.prices.map(item => ({carSize: item.id, price: item.price})) : [])
  }, [itemToEdit]);

  const handleChangeCarSize = (event, carSize) => {
    if (event.target.checked) {
      setCarSizesActive(carSizesActive.concat({carSize: carSize.id}));
    } else {
      const carSizesActiveCopy = [...carSizesActive];
      setCarSizesActive(carSizesActiveCopy.filter(item => item.carSize !== carSize.id))
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSaveItem(carSizesActive);
  };

  const renderPriceInput = (carSize) => {
    const carSizeSelected = carSizesActive.find(item => item.carSize === carSize.id);
    return (
      carSizeSelected ?
        <InputGroup.Prepend>
          <FormControl
            value={carSizeSelected.price}
            type={'number'}
            placeholder={"Price"}
            min={0.01}
            step={0.01}
            onChange={event => handlePriceChange(carSizeSelected, event.target.value)}
          />
        </InputGroup.Prepend>
        : null
    )

  };

  const handlePriceChange = (carSize, newPrice) => {
    const carSizesActiveCopy = Array.from(carSizesActive);
    const selectedIndex = carSizesActiveCopy.findIndex(item => {
      return item.carSize === carSize.carSize
    });

    carSizesActiveCopy[selectedIndex] && (carSizesActiveCopy[selectedIndex].price = newPrice);
    setCarSizesActive(carSizesActiveCopy);

  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Set Plan Prices</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8}>
            <Form onSubmit={handleSubmit}>
              {
                carSizes.map(carSize => {
                  return (
                    <>
                      <InputGroup key={carSize.id} className="mb-2">
                        <InputGroup.Prepend>
                          <InputGroup.Checkbox
                            onChange={(event) => handleChangeCarSize(event, carSize)}
                            checked={carSizesActive.find(item => item.carSize === carSize.id)}
                          />
                        </InputGroup.Prepend>
                        <FormControl
                          value={carSize.name_en}
                          readOnly
                        />
                        {
                          renderPriceInput(carSize)
                        }
                      </InputGroup>
                    </>
                  )
                })
              }
              <Button className="float-right" type="submit">
                Save
              </Button>
            </Form>
          </Col>
        </Row>

      </Modal.Body>
    </Modal>
  );
};
