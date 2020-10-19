import React from "react";
import {Button, Modal} from "react-bootstrap";

export default ({show, handleCancel, signOut}) => {
  return (
    <Modal show={show} onHide={handleCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Log Out </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to <b>log out</b>?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={signOut}>Log Out</Button>
        <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
};
