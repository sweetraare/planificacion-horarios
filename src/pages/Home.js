import React, { useContext } from "react";
import AdminLayout from "../HOC/AdminLayout";
import { AuthContext } from "../App";

export default () => {
  const { user } = useContext(AuthContext);

  return (
    <AdminLayout>
      <h1>Admin Page</h1>
      {user && (
        <h2>
          Welcome, {user.lastName} {user.firstName}
        </h2>
      )}
    </AdminLayout>
  );
};
