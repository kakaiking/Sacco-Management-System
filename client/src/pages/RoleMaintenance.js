import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { FiEye, FiEdit3, FiTrash2, FiCheckCircle, FiClock, FiRotateCcw, FiXCircle } from "react-icons/fi";
import { FaPlus } from 'react-icons/fa';
import DashboardWrapper from '../components/DashboardWrapper';
import { useSnackbar } from "../helpers/SnackbarContext";

function RoleMaintenance() {
  const history = useHistory();
  const { showMessage } = useSnackbar();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      history.push("/login");
    }
  }, [history]);

  // Mock data for roles
  const [roles, setRoles] = useState([
    {
      id: 1,
      roleId: "ADMIN001",
      roleName: "System Administrator",
      description: "Full system access with all permissions",
      permissions: ["Create", "Read", "Update", "Delete", "Manage Users", "System Config"],
      status: "Active",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20"
    },
    {
      id: 2,
      roleId: "USER002",
      roleName: "Regular User",
      description: "Standard user with limited permissions",
      permissions: ["Read", "Update Own Profile"],
      status: "Active",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18"
    },
    {
      id: 3,
      roleId: "MANAGER003",
      roleName: "Department Manager",
      description: "Manager role with department-level permissions",
      permissions: ["Create", "Read", "Update", "Manage Department", "View Reports"],
      status: "Inactive",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-25"
    }
  ]);

  const [search, setSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showBatchActions, setShowBatchActions] = useState(false);

  const counts = useMemo(() => {
    const list = Array.isArray(roles) ? roles : [];
    const c = { Active: 0, Inactive: 0 };
    for (const role of list) {
      if (role.status && c[role.status] !== undefined) c[role.status] += 1;
    }
    return c;
  }, [roles]);

  const filteredRoles = useMemo(() => {
    if (!search) return roles;
    return roles.filter(role =>
      role.roleId?.toLowerCase().includes(search.toLowerCase()) ||
      role.roleName?.toLowerCase().includes(search.toLowerCase()) ||
      role.description?.toLowerCase().includes(search.toLowerCase()) ||
      role.status?.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  const isAllSelected = selectedRoles.length === filteredRoles.length && filteredRoles.length > 0;
  const isIndeterminate = selectedRoles.length > 0 && selectedRoles.length < filteredRoles.length;

  const handleSelectRole = (roleId, checked) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRoles(filteredRoles.map(role => role.id));
    } else {
      setSelectedRoles([]);
    }
  };

  useEffect(() => {
    setShowBatchActions(selectedRoles.length > 0);
  }, [selectedRoles]);

  const handleDelete = async (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        setRoles(prev => prev.filter(role => role.id !== roleId));
        showMessage("Role deleted successfully", "success");
      } catch (err) {
        showMessage("Failed to delete role", "error");
      }
    }
  };

  const handleBatchDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedRoles.length} role(s)?`)) {
      try {
        setRoles(prev => prev.filter(role => !selectedRoles.includes(role.id)));
        showMessage(`${selectedRoles.length} role(s) deleted successfully`, "success");
        setSelectedRoles([]);
      } catch (err) {
        showMessage("Failed to delete roles", "error");
      }
    }
  };

  return (
    <DashboardWrapper>
      <header className="header">
        <div className="header__left">
          <div className="greeting">Role Maintenance</div>
        </div>
      </header>

      <main className="dashboard__content">
        <section className="cards cards--status">
          <div className="card card--approved">
            <div className="card__icon">
              <FiCheckCircle />
            </div>
            <div className="card__content">
              <h4>Active</h4>
              <div className="card__kpi">{counts.Active}</div>
            </div>
          </div>
          <div className="card card--pending">
            <div className="card__icon">
              <FiClock />
            </div>
            <div className="card__content">
              <h4>Inactive</h4>
              <div className="card__kpi">{counts.Inactive}</div>
            </div>
          </div>
          <div className="card card--returned">
            <div className="card__icon">
              <FiRotateCcw />
            </div>
            <div className="card__content">
              <h4>Total</h4>
              <div className="card__kpi">{roles.length}</div>
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: 12 }}>
          <div className="tableToolbar">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  minWidth: "200px"
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {showBatchActions && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "var(--muted-text)" }}>
                    {selectedRoles.length} selected
                  </span>
                  <button
                    className="pill"
                    onClick={handleBatchDelete}
                    style={{
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Delete Selected
                  </button>
                </div>
              )}

              <button
                className="pill"
                onClick={() => history.push("/role-form/new")}
                style={{
                  backgroundColor: "var(--primary-500)",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaPlus size={14} />
                Add Role
              </button>
            </div>
          </div>

          <div className="tableContainer">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th>Role ID</th>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map(role => (
                  <tr key={role.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={(e) => handleSelectRole(role.id, e.target.checked)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td>{role.roleId}</td>
                    <td>{role.roleName}</td>
                    <td>{role.description}</td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {role.permissions.slice(0, 3).map((permission, index) => (
                          <span
                            key={index}
                            style={{
                              backgroundColor: "rgba(99, 102, 241, 0.1)",
                              color: "#6366f1",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "500"
                            }}
                          >
                            {permission}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span
                            style={{
                              backgroundColor: "rgba(107, 114, 128, 0.1)",
                              color: "#6b7280",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "500"
                            }}
                          >
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div 
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: "600",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          backgroundColor: 
                            role.status === "Active" ? "rgba(16, 185, 129, 0.2)" :
                            "rgba(107, 114, 128, 0.2)",
                          color: 
                            role.status === "Active" ? "#059669" :
                            "#6b7280",
                          border: `1px solid ${
                            role.status === "Active" ? "rgba(16, 185, 129, 0.3)" :
                            "rgba(107, 114, 128, 0.3)"
                          }`
                        }}
                      >
                        {role.status}
                      </div>
                    </td>
                    <td>{role.createdAt}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="link"
                          onClick={() => history.push(`/role-form/${role.id}`)}
                          title="View"
                        >
                          <FiEye className="icon icon--view" />
                        </button>
                        <button
                          className="link"
                          onClick={() => history.push(`/role-form/${role.id}?edit=1`)}
                          title="Edit"
                        >
                          <FiEdit3 className="icon icon--edit" />
                        </button>
                        <button
                          className="link link--danger"
                          onClick={() => handleDelete(role.id)}
                          title="Delete"
                        >
                          <FiTrash2 className="icon icon--delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </DashboardWrapper>
  );
}

export default RoleMaintenance;
