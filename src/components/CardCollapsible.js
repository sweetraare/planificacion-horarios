import React, {useState} from "react";
import {Accordion, Button, Card, Col, Row, useAccordionToggle} from "react-bootstrap";
import {faChevronCircleDown, faChevronCircleUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const CustomToggle = ({children, eventKey, isCollapsed}) => {
  const decoratedOnClick = useAccordionToggle(eventKey);
  const [collapsed, setCollapsed] = useState(isCollapsed);

  return (
    <Row onClick={decoratedOnClick}>
      <Col xs={11} className="text-center"><h5>{children}</h5></Col>
      <Col xs={1}>
        <Button
          className="float-right btn-card-accordion pt-0 pb-0"
          onClick={() => setCollapsed(!collapsed)}>
          <FontAwesomeIcon icon={collapsed ? faChevronCircleDown : faChevronCircleUp}/>
        </Button>
      </Col>
    </Row>
  );
};

const CardCollapsible = ({children, title, isCollapsed}) => {
  return (
    <Accordion className="mt-4" defaultActiveKey={(isCollapsed) ? '-1' : '0'}>
      <Card>
        <div style={{padding: '0.5rem', paddingBottom: '0'}}>
          <CustomToggle eventKey="0" isCollapsed={isCollapsed}>
            {title.toUpperCase()}
          </CustomToggle>
          <Accordion.Collapse eventKey="0">
            <React.Fragment>
              <hr/>
              <div>{children}</div>
            </React.Fragment>
          </Accordion.Collapse>
        </div>
      </Card>
    </Accordion>
  )
};

export default CardCollapsible;
