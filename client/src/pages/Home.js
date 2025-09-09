import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";

function Home() {
  const { authState } = useContext(AuthContext);
  let history = useHistory();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      history.push("/login");
    }
  }, [history]);

  useEffect(() => {
    const controller = new AbortController();
    const loadPending = async () => {
      try {
        const res = await axios.get("http://localhost:3001/members", {
          headers: { accessToken: localStorage.getItem("accessToken") },
          params: { status: "Pending" },
          signal: controller.signal,
        });
        const list = res?.data?.entity ?? res?.data;
        setPendingCount(Array.isArray(list) ? list.length : 0);
      } catch {}
    };
    loadPending();
    return () => controller.abort();
  }, []);

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header__left">
          <div className="brand">
            <span className="brand__logo">S</span>
            <span className="brand__name">SACCO SPHERE</span>
          </div>
          <div className="greeting">Welcome, {authState?.username || "John Doe"}!</div>
        </div>
        {/* avatar moved to global navbar dropdown */}
      </header>

      <main className="dashboard__content">
        <section className="cards">
          <div className="card">
            <h3>Pending Members</h3>
            <div className="card__kpi">{pendingCount}</div>
            <button className="pill" onClick={() => history.push("/member-maintenance")}>Review</button>
          </div>

          <div className="card">
            <h3>Recent Transactions</h3>
            <ul className="list">
              <li>Jane Smith – Deposit • KES 15,000 – KES 7,000</li>
              <li>Peter Kinani – Loan Pmt • KES 2,600</li>
              <li>Mary Njoroge • KES 2,000</li>
              <li>Mary Njoroge • KES 2,000</li>
            </ul>
          </div>

          <div className="card">
            <h3>Announcements</h3>
            <ul className="list">
              <li>Annual General Meeting – Oct 26th</li>
              <li>System Update – Oct 20th</li>
            </ul>
          </div>
        </section>

        <section className="charts">
          <div className="card chart">
            <h3>Deposits Comparison</h3>
            <div className="bar-chart">
              <div className="bar bar--grey" style={{ height: "130px" }} />
              <div className="bar bar--green" style={{ height: "160px" }} />
            </div>
            <div className="chart__legend">
              <span className="dot dot--grey" /> Previous Month
              <span style={{ width: 12 }} />
              <span className="dot dot--green" /> Current Month
            </div>
          </div>

          <div className="card chart">
            <h3>Loans Disbursed</h3>
            <div className="bar-chart">
              <div className="bar bar--grey" style={{ height: "140px" }} />
              <div className="bar bar--green" style={{ height: "150px" }} />
            </div>
            <div className="chart__legend">
              <span className="dot dot--grey" /> Previous Month
              <span style={{ width: 12 }} />
              <span className="dot dot--green" /> Current Month
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
