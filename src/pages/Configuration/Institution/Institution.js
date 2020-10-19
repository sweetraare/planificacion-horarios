import React, { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./Institution.scss";
import { newErrorToast, newSuccessToast } from "../../../utils/toasts";
import {
  addComments,
  addInstitution,
  getComments,
  getInstitution,
  listenComments,
  listenInstitution,
} from "../../../services/firebase/operations/institution";

export default () => {
  const [Institution_Name, setInstitution_Name] = useState("");
  const [Comments, setComments] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const institutionFetched = await getInstitution();
        const commentsFetched = await getComments();

        return {
          institutionFetched,
          commentsFetched,
        };
      } catch (error) {
        return error;
      }
    };

    fetchData()
      .then((data) => {
        const { institutionFetched, commentsFetched } = data;

        if (institutionFetched.exists()) {
          setInstitution_Name(institutionFetched.val());
        }
        if (commentsFetched.exists()) {
          setComments(commentsFetched.val());
        }
      })
      .catch((error) => newErrorToast(`Error: ${error.message}`));

    //real time update
    listenInstitutionChange();
    listenCommentsChange();
  }, []);

  const listenInstitutionChange = () => {
    listenInstitution((institution) => {
      institution.exists() && setInstitution_Name(institution.val());
    });
  };

  const listenCommentsChange = () => {
    listenComments((comments) => {
      comments.exists() && setComments(comments.val());
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await addInstitution(Institution_Name);
      await addComments(Comments);

      newSuccessToast(`Los cambios fueron realizados con éxito`);
    } catch (e) {
      console.log("error:", e);
      newErrorToast(`Error: ${e.message}`);
    }
  };

  return (
    <Card>
      <Card.Title>Información del centro</Card.Title>
      <Card.Body className="pt-0">
        <Form onSubmit={handleSubmit}>
          <div className="notification-form">
            {/*Nombre Form Group*/}
            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Nombre:{" "}
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  name="title_en"
                  type="text"
                  value={Institution_Name}
                  required
                  onChange={(event) => setInstitution_Name(event.target.value)}
                />
              </Col>
            </Form.Group>
            {/*Comentario Form Group*/}
            <Form.Group as={Row}>
              <Form.Label column sm={3}>
                Comentario:{" "}
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  as="textarea"
                  value={Comments}
                  name="text_en"
                  maxLength={200}
                  onChange={(event) => setComments(event.target.value)}
                  rows={2}
                  required
                />
              </Col>
            </Form.Group>
          </div>
          <div className="pt-3">
            <Button type="submit" variant="primary" className="float-right">
              Guardar&nbsp;
              <FontAwesomeIcon icon={faSave} />
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};
