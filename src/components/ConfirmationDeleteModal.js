import React from "react";
import {Button, Modal} from "react-bootstrap";

export default ({show, title, objectDescription, handleClose, handleAccept}) => {

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete {title} </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete {title} <b>{objectDescription}</b>? This can not be undone</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleAccept}>Delete</Button>
      </Modal.Footer>
    </Modal>
  )
};
