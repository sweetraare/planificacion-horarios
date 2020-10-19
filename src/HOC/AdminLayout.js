import React, { useContext, useEffect, useState } from "react";
import SideBarMenu from "../components/SideBarMenu";
import { Container } from "react-bootstrap";

import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import { FORBIDDEN_PAGE } from "../constants/routes";
import { AuthContext } from "../App";
import { useHistory } from "react-router-dom";
import isEqual from "lodash/isEqual";

export default ({ children }) => {
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const role = user ? user["role"] : "public";

  const [expanded, setExpanded] = useState(false);

  const onToggle = (expanded) => {
    setExpanded(expanded);
  };

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      if (!isEqual(role, "admin")) {
        //comment in development
        history.push(FORBIDDEN_PAGE);
      }
    }
  }, [history, role]);

  return (
    <>
      <SideBarMenu onToggle={onToggle} />
      <div style={{ marginLeft: expanded ? "240px" : "64px" }}>
        <Container fluid className="mt-3">
          {children}
        </Container>
      </div>
    </>
  );
};
