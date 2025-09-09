import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiTool, FiSettings, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { AuthContext } from "../helpers/AuthContext";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const location = useLocation();
  const { authState } = React.useContext(AuthContext);

  return (
    <>
      <div className={`overlay ${isOpen ? "overlay--visible" : ""}`} onClick={() => setIsOpen(false)} />
      <aside className={`o-sidebar ${isOpen ? "open" : ""}`}>
        <div className="o-sidebar__brand">
          {authState.status && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
              <div 
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "#fff",
                  color: "var(--primary-700)",
                  fontWeight: "700",
                  fontSize: "24px",
                  marginBottom: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              >
                {authState?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ 
                color: "var(--primary-700)", 
                fontWeight: "600", 
                fontSize: "16px",
                textAlign: "center"
              }}>
                {authState?.username || "User"}
              </div>
            </div>
          )}
        </div>

        <hr style={{ margin: "0 16px", border: "none", borderTop: "1px solid var(--border)" }} />

        <nav className="o-menu">
          <Link className={`o-menu__item ${location.pathname === "/" ? "active" : ""}`} to="/" onClick={() => setIsOpen(false)}>
            <span className="o-menu__icon"><FiHome /></span>
            <span className="o-menu__label">Home</span>
          </Link>

          <Link className={`o-menu__item`} type="button" onClick={() => setAdminOpen(v => !v)}>
            <span className="o-menu__icon"><FiTool /></span>
            <span className="o-menu__label">Admin</span>
            <button className={`o-menu__arrow ${adminOpen ? "up" : "down"}`}>{adminOpen ? <FiChevronUp /> : <FiChevronDown />}</button>

          </Link>

          
          {adminOpen && (
            <div className="o-submenu">
              <Link className={`o-submenu__item ${location.pathname === "/member-maintenance" ? "active" : ""}`} to="/member-maintenance" onClick={() => setIsOpen(false)}>Member Maintenance</Link>
              <Link className={`o-submenu__item ${location.pathname === "/createpost" ? "active" : ""}`} to="/createpost" onClick={() => setIsOpen(false)}>User Maintenance</Link>
              {/* <button className="o-submenu__item" disabled>Role Maintenance</button> */}
            </div>
          )}

          <Link className={`o-menu__item`} type="button" onClick={() => setConfigOpen(v => !v)}>
            <span className="o-menu__icon"><FiSettings /></span>
            <span className="o-menu__label">Configurations</span>
            <button className={`o-menu__arrow ${configOpen ? "up" : "down"}`}>{configOpen ? <FiChevronUp /> : <FiChevronDown />}</button>
          </Link>

          {configOpen && (
            <div className="o-submenu">
              <Link className={`o-submenu__item ${location.pathname === "/product-maintenance" ? "active" : ""}`} to="/product-maintenance" onClick={() => setIsOpen(false)}>Product Maintenance</Link>
            </div>
          )}
        </nav>

        <button className="o-handle" onClick={() => setIsOpen(v => !v)} aria-label="Toggle sidebar">
          <span className="o-handle__arrow">{isOpen ? <FiChevronLeft /> : <FiChevronRight />}</span>
        </button>
      </aside>
    </>
  );
}

export default Sidebar;


