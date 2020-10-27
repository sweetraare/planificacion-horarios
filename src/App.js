import React, { useEffect, useState } from "react";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "react-image-crop/dist/ReactCrop.css";
import { getUserById } from "./services/firebase/operations/users";
import { ToastContainer } from "react-toastify";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import {
  HOME_PAGE,
  AUTHENTICATION_SERVICES,
  CONFIG_PAGE,
  LOGIN_PAGE,
  RESET_PASSWORD,
  TEACHERS_PAGE,
  STUDENTS_PAGE,
  SPACES_PAGE,
  TAGS_PAGE,
  SUBJECTS_PAGE,
  ACTIVITIES_PAGE,
  TIMETABLE_PAGE,
} from "./constants/routes";

import { auth } from "./services/firebase/config";
// Pages
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home/Home";
import ResetPasswordPage from "./pages/ResetPassword";
import PageNotFound from "./pages/PageNotFound";
import ChangePasswordPage from "./pages/AuthenticationServices";
import ConfigurationPage from "./pages/Configuration/ConfigurationPage";
///////////////////
import SubjectsPage from "./pages/Subjects/SubjectsPage";
import TeachersPage from "./pages/Teachers/TeachersPage";
import StudentsPage from "./pages/Students/StudentsPage";
import SpacesPage from "./pages/Spaces/SpacesPage";
import TagsPage from "./pages/Tags/TagsPage";
import ActivitiesPage from "./pages/Activities/ActivitiesPage";
import TimetablePage from "./pages/Timetable/TimetablePage";

export const AuthContext = React.createContext(null);

export default () => {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("");

  const contextValue = { user, plan, setPlan };

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      try {
        if (user.uid) {
          const userInfo = await getUserById(user.uid);
          const userFetched = userInfo.val();
          setUser(userFetched.role === "admin" ? userFetched : null);
        }
      } catch (error) {
        if (error.message !== "user is null") {
          console.error(error);
        }
      }
    });
  }, []);

  return (
    <>
      <AuthContext.Provider value={contextValue}>
        <Router>
          <Switch>
            <Route exact path="/">
              <Redirect to={LOGIN_PAGE} />
            </Route>
            <Route path={HOME_PAGE} exact component={HomePage} />
            <Route path={RESET_PASSWORD} exact component={ResetPasswordPage} />
            <Route path={LOGIN_PAGE} exact component={LoginPage} />
            <Route path={STUDENTS_PAGE} exact component={StudentsPage} />
            <Route path={ACTIVITIES_PAGE} exact component={ActivitiesPage} />

            <Route
              path={AUTHENTICATION_SERVICES}
              exact
              component={ChangePasswordPage}
            />
            <Route path={CONFIG_PAGE} exact component={ConfigurationPage} />
            <Route path={SPACES_PAGE} exact component={SpacesPage} />
            <Route path={TAGS_PAGE} exact component={TagsPage} />
            <Route path={SUBJECTS_PAGE} exact component={SubjectsPage} />
            <Route path={TEACHERS_PAGE} exact component={TeachersPage} />
            <Route path={TIMETABLE_PAGE} exact component={TimetablePage} />
            {/*<Route path={FORBIDDEN_PAGE} component={ForbiddenPage}/>*/}
            <Route path="*" component={PageNotFound} />
          </Switch>
        </Router>
      </AuthContext.Provider>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnVisibilityChange
        draggable
        pauseOnHover
      />
    </>
  );
};
