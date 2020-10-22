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
  AUTHENTICATION_SERVICES,
  COMMENTS_PAGE,
  CONFIG_PAGE,
  DISCOUNTS_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  PLAN_PAGE,
  PRODUCTS_PAGE,
  REFUNDS_PAGE,
  REPORTS_PAGE,
  RESET_PASSWORD,
  USERS_PAGE,
  VIRTUALCARD_PAGE,
  SUBJECTS_PAGE,
  TEACHERS_PAGE,
  STUDENTS_PAGE,
  SPACES_PAGE,
} from "./constants/routes";

import { auth } from "./services/firebase/config";
// Pages
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home/Home";
import PlanPage from "./pages/Plan/Plan";
import DiscountPage from "./pages/Discount/Discount";
import ResetPasswordPage from "./pages/ResetPassword";
import VirtualCardPage from "./pages/VirtualCard/VirtualCard";
import ProductsPage from "./pages/Products/Products";
import PageNotFound from "./pages/PageNotFound";
import UsersPage from "./pages/Users/Users";
import CommentsPage from "./pages/Comments/Comments";
import ChangePasswordPage from "./pages/AuthenticationServices";
import ConfigurationPage from "./pages/Configuration/ConfigurationPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import RefundsPage from "./pages/Refunds/RefundsPage";
///////////////////
import SubjectsPage from "./pages/Subjects/SubjectsPage";
import TeachersPage from "./pages/Teachers/TeachersPage";
import StudentsPage from "./pages/Students/StudentsPage";
import SpacesPage from "./pages/Spaces/SpacesPage";

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
            <Route path={PLAN_PAGE} exact component={PlanPage} />
            <Route path={DISCOUNTS_PAGE} exact component={DiscountPage} />
            <Route path={VIRTUALCARD_PAGE} exact component={VirtualCardPage} />
            <Route path={PRODUCTS_PAGE} exact component={ProductsPage} />
            <Route path={USERS_PAGE} exact component={UsersPage} />
            <Route path={COMMENTS_PAGE} exact component={CommentsPage} />
            <Route path={SUBJECTS_PAGE} exact component={SubjectsPage} />
            <Route path={TEACHERS_PAGE} exact component={TeachersPage} />
            <Route path={STUDENTS_PAGE} exact component={StudentsPage} />

            <Route
              path={AUTHENTICATION_SERVICES}
              exact
              component={ChangePasswordPage}
            />
            <Route path={CONFIG_PAGE} exact component={ConfigurationPage} />
            <Route path={REPORTS_PAGE} exact component={ReportsPage} />
            <Route path={REFUNDS_PAGE} exact component={RefundsPage} />
            <Route path={SPACES_PAGE} exact component={SpacesPage} />

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
