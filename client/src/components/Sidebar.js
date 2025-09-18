import React, { useState } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import { FiHome, FiTool, FiSettings, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { AuthContext } from "../helpers/AuthContext";
import { useSidebar } from "../helpers/SidebarContext";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../helpers/PermissionUtils";
import frontendLoggingService from "../services/frontendLoggingService";

function Sidebar() {
  const { isOpen, setIsOpen, isAuthenticated } = useSidebar();
  const [adminOpen, setAdminOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [accountingOpen, setAccountingOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { authState } = React.useContext(AuthContext);
  const { canView } = usePermissions();
  

  return (
    <>
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
              <div style={{ 
                color: "var(--muted-text)", 
                fontWeight: "500", 
                fontSize: "12px",
                textAlign: "center",
                marginTop: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {authState?.role || "User"}
              </div>
            </div>
          )}
        </div>

        <hr style={{ margin: "0 16px", border: "none", borderTop: "1px solid var(--border)" }} />

        <nav className="o-menu">
          <button className={`o-menu__item ${location.pathname === "/" ? "active" : ""}`} type="button" onClick={() => {
            frontendLoggingService.logMenuClick("Home");
            history.push("/");
          }}>
            <span className="o-menu__icon"><FiHome /></span>
            <span className="o-menu__label">Home</span>
          </button>
          

          {/* Admin Section - Only show if user has permission to view any admin module */}
          {(canView(PERMISSIONS.MEMBER_MAINTENANCE) ||
            canView(PERMISSIONS.USER_MAINTENANCE) ||
            canView(PERMISSIONS.ROLE_MAINTENANCE) ||
            canView(PERMISSIONS.LOGS_MAINTENANCE) ||
            canView(PERMISSIONS.LOAN_CALCULATOR)) && (
            <>
              <button className={`o-menu__item`} type="button" onClick={() => {
                frontendLoggingService.logMenuClick("Admin", adminOpen ? "Close" : "Open");
                setAdminOpen(v => !v);
                setConfigOpen(false);
                setAccountingOpen(false);
                setTransactionsOpen(false);
              }}>
                <span className="o-menu__icon"><FiTool /></span>
                <span className="o-menu__label">Admin</span>
                <span className={`o-menu__arrow ${adminOpen ? "up" : "down"}`}>{adminOpen ? <FiChevronUp /> : <FiChevronDown />}</span>
              </button>

              {adminOpen && (
                <div className="o-submenu">
                  {canView(PERMISSIONS.MEMBER_MAINTENANCE) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/member-maintenance" ? "active" : ""}`} 
                      to="/member-maintenance"
                      onClick={() => frontendLoggingService.logMenuClick("Admin", "Member Maintenance")}
                    >
                      Member Maintenance
                    </Link>
                  )}
                  {canView(PERMISSIONS.USER_MAINTENANCE) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/user-maintenance" ? "active" : ""}`} 
                      to="/user-maintenance"
                      onClick={() => frontendLoggingService.logMenuClick("Admin", "User Maintenance")}
                    >
                      User Maintenance
                    </Link>
                  )}
                  {canView(PERMISSIONS.ROLE_MAINTENANCE) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/role-maintenance" ? "active" : ""}`} 
                      to="/role-maintenance"
                      onClick={() => frontendLoggingService.logMenuClick("Admin", "Role Maintenance")}
                    >
                      Role Maintenance
                    </Link>
                  )}
                  {canView(PERMISSIONS.LOGS_MAINTENANCE) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/logs-management" ? "active" : ""}`} 
                      to="/logs-management"
                      onClick={() => frontendLoggingService.logMenuClick("Admin", "Logs")}
                    >
                      Logs
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* Configurations Section - Only show if user has permission to view any config module */}
          {(canView(PERMISSIONS.PRODUCT_MAINTENANCE) ||
            canView(PERMISSIONS.CURRENCY_MAINTENANCE) ||
            canView(PERMISSIONS.SACCO_MAINTENANCE) ||
            canView(PERMISSIONS.BRANCH_MAINTENANCE) ||
            canView(PERMISSIONS.CHARGES_MANAGEMENT)) && (
            <>
              <button className={`o-menu__item`} type="button" onClick={() => {
                frontendLoggingService.logMenuClick("Configurations", configOpen ? "Close" : "Open");
                setConfigOpen(v => !v);
                setAdminOpen(false);
                setAccountingOpen(false);
                setTransactionsOpen(false);
              }}>
                <span className="o-menu__icon"><FiSettings /></span>
                <span className="o-menu__label">Configurations</span>
                <span className={`o-menu__arrow ${configOpen ? "up" : "down"}`}>{configOpen ? <FiChevronUp /> : <FiChevronDown />}</span>
              </button>

              {configOpen && (
                <div className="o-submenu">
                  {canView(PERMISSIONS.PRODUCT_MAINTENANCE) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/product-maintenance" ? "active" : ""}`} 
                      to="/product-maintenance"
                      onClick={() => frontendLoggingService.logMenuClick("Configurations", "Product Maintenance")}
                    >
                      Product Maintenance
                    </Link>
                  )}
                  {canView(PERMISSIONS.CURRENCY_MAINTENANCE) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/currency-maintenance" ? "active" : ""}`} 
                      to="/currency-maintenance"
                      onClick={() => frontendLoggingService.logMenuClick("Configurations", "Currency Maintenance")}
                    >
                      Currency Maintenance
                    </Link>
                  )}
                  {canView(PERMISSIONS.SACCO_MAINTENANCE) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/sacco-maintenance" ? "active" : ""}`} 
                      to="/sacco-maintenance"
                      onClick={() => frontendLoggingService.logMenuClick("Configurations", "Sacco Maintenance")}
                    >
                      Sacco Maintenance
                    </Link>
                  )}
                  {canView(PERMISSIONS.BRANCH_MAINTENANCE) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/branch-maintenance" ? "active" : ""}`} 
                      to="/branch-maintenance"
                      onClick={() => frontendLoggingService.logMenuClick("Configurations", "Branch Maintenance")}
                    >
                      Branch Maintenance
                    </Link>
                  )}
                  {canView(PERMISSIONS.CHARGES_MANAGEMENT) && (
                    <Link 
                      className={`o-submenu__item ${location.pathname === "/charges-management" ? "active" : ""}`} 
                      to="/charges-management"
                      onClick={() => frontendLoggingService.logMenuClick("Configurations", "Charges Management")}
                    >
                      Charges Management
                    </Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* Accounting Section - Only show if user has permission to view accounting module */}
          {canView(PERMISSIONS.ACCOUNTS_MANAGEMENT) && (
            <>
              <button className={`o-menu__item`} type="button" onClick={() => {
                setAccountingOpen(v => !v);
                setAdminOpen(false);
                setConfigOpen(false);
                setTransactionsOpen(false);
              }}>
                <span className="o-menu__icon"><FiSettings /></span>
                <span className="o-menu__label">Accounting</span>
                <span className={`o-menu__arrow ${accountingOpen ? "up" : "down"}`}>{accountingOpen ? <FiChevronUp /> : <FiChevronDown />}</span>
              </button>

              {accountingOpen && (
                <div className="o-submenu">
                  <Link className={`o-submenu__item ${location.pathname === "/accounts-management" ? "active" : ""}`} to="/accounts-management">Accounts Management</Link>
                  {canView(PERMISSIONS.LOAN_CALCULATOR) && (
                    <Link className={`o-submenu__item ${location.pathname === "/loan-calculator" ? "active" : ""}`} to="/loan-calculator">Loan Calculator</Link>
                  )}
                </div>
              )}
            </>
          )}

          {/* Transactions Section - Only show if user has permission to view transactions module */}
          {canView(PERMISSIONS.TRANSACTION_MAINTENANCE) && (
            <>
              <button className={`o-menu__item`} type="button" onClick={() => {
                frontendLoggingService.logMenuClick("Transactions", transactionsOpen ? "Close" : "Open");
                setTransactionsOpen(v => !v);
                setAdminOpen(false);
                setConfigOpen(false);
                setAccountingOpen(false);
              }}>
                <span className="o-menu__icon"><FiSettings /></span>
                <span className="o-menu__label">Transactions</span>
                <span className={`o-menu__arrow ${transactionsOpen ? "up" : "down"}`}>{transactionsOpen ? <FiChevronUp /> : <FiChevronDown />}</span>
              </button>

              {transactionsOpen && (
                <div className="o-submenu">
                  <Link 
                    className={`o-submenu__item ${location.pathname === "/transactions" ? "active" : ""}`} 
                    to="/transactions"
                    onClick={() => frontendLoggingService.logMenuClick("Transactions", "Transactions Universe")}
                  >
                    Transactions Universe
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        <button 
          className="o-handle" 
          onClick={() => setIsOpen(v => !v)} 
          aria-label="Toggle sidebar"
          disabled={!isAuthenticated}
          style={{
            opacity: !isAuthenticated ? 0.5 : 1,
            cursor: !isAuthenticated ? 'not-allowed' : 'pointer'
          }}
        >
          <span className="o-handle__arrow">{isOpen ? <FiChevronLeft /> : <FiChevronRight />}</span>
        </button>
      </aside>
    </>
  );
}

export default Sidebar;


