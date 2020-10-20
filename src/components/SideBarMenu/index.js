import React, { useState } from "react";
import SideNav, { NavIcon, NavItem, NavText } from "@trendmicro/react-sidenav";
import { useLocation, withRouter } from "react-router-dom";
import {
  faBook,
  faChalkboardTeacher,
  faCogs,
  faDoorOpen,
  faHome,
  faSchool,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CONFIG_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  PRODUCTS_PAGE,
  VIRTUALCARD_PAGE,
  SUBJECTS_PAGE,
  TEACHERS_PAGE,
  STUDENTS_PAGE,
} from "../../constants/routes";
import LogOutModal from "../LogOutModal";

import "./styles.scss";
import { SignOut } from "../../services/firebase/auth";

const SideBarMenu = ({ history, onToggle }) => {
  const [selected, setSelected] = useState(useLocation().pathname.substring(1));
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const onSelect = (selected) => {
    selected && history.push({ pathname: "/" + selected });
    setSelected(selected);
  };

  const signOut = async () => {
    await SignOut();
    history.push(LOGIN_PAGE);
    window.location.reload();
  };

  const handleShowModalCancel = () => {
    setShowLogoutModal(false);
    history.push(HOME_PAGE);
  };

  return (
    <>
      <SideNav onSelect={onSelect} onToggle={onToggle} className="side-nav">
        <SideNav.Toggle />
        <SideNav.Nav selected={selected}>
          <NavItem eventKey={HOME_PAGE.substring(1)}>
            <NavIcon>
              <FontAwesomeIcon icon={faHome} className="icon" />
            </NavIcon>
            <NavText>Inicio</NavText>
          </NavItem>
          <NavItem eventKey={SUBJECTS_PAGE.substring(1)}>
            <NavIcon>
              <FontAwesomeIcon icon={faBook} className="icon" />
            </NavIcon>
            <NavText>Materias</NavText>
          </NavItem>
          <NavItem eventKey={TEACHERS_PAGE.substring(1)}>
            <NavIcon>
              <FontAwesomeIcon icon={faChalkboardTeacher} className="icon" />
            </NavIcon>
            <NavText>Profesores</NavText>
          </NavItem>
          <NavItem eventKey={STUDENTS_PAGE.substring(1)}>
            <NavIcon>
              <FontAwesomeIcon icon={faUserGraduate} className="icon" />
            </NavIcon>
            <NavText>Estudiantes</NavText>
          </NavItem>
          <NavItem eventKey={PRODUCTS_PAGE.substring(1)}>
            <NavIcon>
              <FontAwesomeIcon icon={faSchool} className="icon" />
            </NavIcon>
            <NavText>Lugares</NavText>
          </NavItem>
          <NavItem eventKey={CONFIG_PAGE.substring(1)}>
            <NavIcon>
              <FontAwesomeIcon icon={faCogs} className="icon" />
            </NavIcon>
            <NavText>Configuración</NavText>
          </NavItem>

          <NavItem onClick={() => setShowLogoutModal(true)}>
            <NavIcon>
              <FontAwesomeIcon icon={faDoorOpen} className="icon" />
            </NavIcon>
            <NavText>Log Out</NavText>
          </NavItem>
        </SideNav.Nav>
      </SideNav>

      <LogOutModal
        show={showLogoutModal}
        handleCancel={handleShowModalCancel}
        signOut={signOut}
      />
    </>
  );
};

export default withRouter(SideBarMenu);
