import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

function Admin() {
  const history = useHistory();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      history.push("/login");
    }
  }, [history]);

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header__left">
          <div className="brand">
            <span className="brand__logo">S</span>
            <span className="brand__name">SACCOFLOW</span>
          </div>
          <div className="greeting">Admin</div>
        </div>
      </header>

      <main className="dashboard__content">
        <div className="card">
          <h3>Admin Overview</h3>
          <p>Use the arrow to expand and access Admin sub-menus.</p>
        </div>
      </main>
    </div>
  );
}

export default Admin;





