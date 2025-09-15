import React, { useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEdit3, FiTrash2, FiCheckCircle, FiClock, FiRotateCcw, FiXCircle } from "react-icons/fi";
import { FaPlus } from 'react-icons/fa';
import DashboardWrapper from '../components/DashboardWrapper';
import { useSnackbar } from "../helpers/SnackbarContext";
import { AuthContext } from "../helpers/AuthContext";

function MemberMaintenance() {
  const history = useHistory();
  const { showMessage } = useSnackbar();
  const { authState, isLoading } = useContext(AuthContext);

  useEffect(() => {
    // Only redirect if authentication check is complete and user is not authenticated
    if (!isLoading && !authState.status) {
      history.push("/login");
    }
  }, [authState, isLoading, history]);

  const [members, setMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState("");
  const [verifierRemarks, setVerifierRemarks] = useState("");
  const [sortField, setSortField] = useState("memberNo");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const controller = new AbortController();
    const fetchMembers = async () => {
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (search) params.q = search;
        const res = await axios.get("http://localhost:3001/members", {
          headers: { accessToken: localStorage.getItem("accessToken") },
          params,
          signal: controller.signal,
        });
        const payload = res?.data?.entity ?? res?.data;
        setMembers(Array.isArray(payload) ? payload : []);
      } catch {}
    };
    fetchMembers();
    return () => controller.abort();
  }, [statusFilter, search]);

  const counts = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    const c = { Approved: 0, Pending: 0, Returned: 0, Rejected: 0 };
    for (const m of list) {
      if (m.status && c[m.status] !== undefined) c[m.status] += 1;
    }
    return c;
  }, [members]);

  const sortedMembers = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    return [...list].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (sortField === 'dateOfBirth') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [members, sortField, sortDirection]);

  // Selection functions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMembers(sortedMembers.map(m => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleSelectMember = (memberId, checked) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  const isAllSelected = selectedMembers.length === sortedMembers.length && sortedMembers.length > 0;
  const isIndeterminate = selectedMembers.length > 0 && selectedMembers.length < sortedMembers.length;

  // Show/hide batch actions based on selection
  useEffect(() => {
    setShowBatchActions(selectedMembers.length > 0);
  }, [selectedMembers]);

  // Status change functions
  const handleStatusChange = (action) => {
    setStatusAction(action);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      const promises = selectedMembers.map(memberId => 
        axios.put(`http://localhost:3001/members/${memberId}`, {
          status: statusAction,
          verifierRemarks: verifierRemarks
        }, { 
          headers: { accessToken: localStorage.getItem("accessToken") } 
        })
      );
      
      await Promise.all(promises);
      
      // Update local state
      setMembers(prev => prev.map(member => 
        selectedMembers.includes(member.id) 
          ? { ...member, status: statusAction, verifierRemarks: verifierRemarks }
          : member
      ));
      
      showMessage(`${statusAction} ${selectedMembers.length} member(s) successfully`, "success");
      setSelectedMembers([]);
      setShowStatusModal(false);
      setVerifierRemarks("");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update member status";
      showMessage(msg, "error");
    }
  };

  return (
    <DashboardWrapper>
      <header className="header">
        <div className="header__left">
          {/* <div className="brand">
            <span className="brand__logo">S</span>
            <span className="brand__name">SACCOFLOW</span>
          </div> */}
          <div className="greeting">Member Maintenance</div>
        </div>
      </header>

      <main className="dashboard__content">
        <section className="cards cards--status">
          <div className="card card--approved">
            <div className="card__icon">
              <FiCheckCircle />
            </div>
            <div className="card__content">
              <h4>Approved</h4>
              <div className="card__kpi">{counts.Approved}</div>
            </div>
          </div>
          <div className="card card--pending">
            <div className="card__icon">
              <FiClock />
            </div>
            <div className="card__content">
              <h4>Pending</h4>
              <div className="card__kpi">{counts.Pending}</div>
            </div>
          </div>
          <div className="card card--returned">
            <div className="card__icon">
              <FiRotateCcw />
            </div>
            <div className="card__content">
              <h4>Returned</h4>
              <div className="card__kpi">{counts.Returned}</div>
            </div>
          </div>
          <div className="card card--rejected">
            <div className="card__icon">
              <FiXCircle />
            </div>
            <div className="card__content">
              <h4>Rejected</h4>
              <div className="card__kpi">{counts.Rejected}</div>
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: 12 }}>
          <div className="tableToolbar">
            <select className="statusSelect" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Returned">Returned</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select 
              className="statusSelect" 
              value={`${sortField}-${sortDirection}`} 
              onChange={e => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field);
                setSortDirection(direction);
              }}
              style={{ marginLeft: "12px" }}
            >
              <option value="memberNo-asc">Member No (A-Z)</option>
              <option value="memberNo-desc">Member No (Z-A)</option>
              <option value="firstName-asc">First Name (A-Z)</option>
              <option value="firstName-desc">First Name (Z-A)</option>
              <option value="lastName-asc">Last Name (A-Z)</option>
              <option value="lastName-desc">Last Name (Z-A)</option>
              <option value="dateOfBirth-asc">Date of Birth (Oldest)</option>
              <option value="dateOfBirth-desc">Date of Birth (Newest)</option>
              <option value="status-asc">Status (A-Z)</option>
              <option value="status-desc">Status (Z-A)</option>
            </select>

            <div className="searchWrapper">
              <input className="searchInput" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..." />
              <span className="searchIcon">🔍</span>
            </div>


            <button 
              className="pill" 
              onClick={() => history.push("/member/new")}
              style={{
                backgroundColor: "var(--primary-500)",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(63, 115, 179, 0.2)"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--primary-600)";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(63, 115, 179, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--primary-500)";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(63, 115, 179, 0.2)";
              }}
              title="Add Member"
            >
              <FaPlus />
              Add Member
            </button>

            {/* Batch Action Buttons */}
            {showBatchActions && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "var(--muted-text)", marginRight: "8px" }}>
                  {selectedMembers.length} selected
                </span>
                <button 
                  className="pill" 
                  onClick={() => handleStatusChange("Approved")}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Approve
                </button>
                <button 
                  className="pill" 
                  onClick={() => handleStatusChange("Returned")}
                  style={{
                    backgroundColor: "#f97316",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Return
                </button>
                <button 
                  className="pill" 
                  onClick={() => handleStatusChange("Rejected")}
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
                  Reject
                </button>
              </div>
            )}

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
                  <th>
                    Member No
                    {sortField === 'memberNo' && (
                      <span style={{ marginLeft: '8px', color: 'var(--primary-500)' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>
                    First Name
                    {sortField === 'firstName' && (
                      <span style={{ marginLeft: '8px', color: 'var(--primary-500)' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>
                    Last Name
                    {sortField === 'lastName' && (
                      <span style={{ marginLeft: '8px', color: 'var(--primary-500)' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Gender</th>
                  <th>
                    Date of Birth
                    {sortField === 'dateOfBirth' && (
                      <span style={{ marginLeft: '8px', color: 'var(--primary-500)' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Nationality</th>
                  <th>ID Number</th>
                  <th>
                    Status
                    {sortField === 'status' && (
                      <span style={{ marginLeft: '8px', color: 'var(--primary-500)' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map(m => (
                  <tr key={m.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(m.id)}
                        onChange={(e) => handleSelectMember(m.id, e.target.checked)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td>{m.memberNo}</td>
                    <td>{m.firstName}</td>
                    <td>{m.lastName}</td>
                    <td>{m.gender}</td>
                    <td>{m.dateOfBirth}</td>
                    <td>{m.nationality}</td>
                    <td>{m.identificationNumber}</td>
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
                            m.status === "Approved" ? "rgba(16, 185, 129, 0.2)" :
                            m.status === "Pending" ? "rgba(6, 182, 212, 0.2)" :
                            m.status === "Returned" ? "rgba(249, 115, 22, 0.2)" :
                            m.status === "Rejected" ? "rgba(239, 68, 68, 0.2)" :
                            "rgba(107, 114, 128, 0.2)",
                          color: 
                            m.status === "Approved" ? "#059669" :
                            m.status === "Pending" ? "#0891b2" :
                            m.status === "Returned" ? "#ea580c" :
                            m.status === "Rejected" ? "#dc2626" :
                            "#6b7280",
                          border: `1px solid ${
                            m.status === "Approved" ? "rgba(16, 185, 129, 0.3)" :
                            m.status === "Pending" ? "rgba(6, 182, 212, 0.3)" :
                            m.status === "Returned" ? "rgba(249, 115, 22, 0.3)" :
                            m.status === "Rejected" ? "rgba(239, 68, 68, 0.3)" :
                            "rgba(107, 114, 128, 0.3)"
                          }`
                        }}
                      >
                        {m.status}
                      </div>
                    </td>
                    <td className="actions">
                      <button className="action-btn action-btn--view" onClick={() => history.push(`/member/${m.id}`)} title="View">
                        <FiEye />
                      </button>
                      <button className="action-btn action-btn--edit" onClick={() => history.push(`/member/${m.id}?edit=1`)} title="Update">
                        <FiEdit3 />
                      </button>
                      <button className="action-btn action-btn--delete" onClick={async () => {
                        try {
                          await axios.delete(`http://localhost:3001/members/${m.id}`, { headers: { accessToken: localStorage.getItem("accessToken") } });
                          setMembers(curr => curr.filter(x => x.id !== m.id));
                          showMessage("Member deleted successfully", "success");
                        } catch (err) {
                          const msg = err?.response?.data?.error || "Failed to delete member";
                          showMessage(msg, "error");
                        }
                      }} title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000
          }}
          onClick={() => setShowStatusModal(false)}
        >
          <div 
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflow: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px 0", color: "var(--primary-700)" }}>
              Confirm Status Change
            </h3>
            
            <p style={{ marginBottom: "20px", color: "var(--muted-text)", textAlign: "center" }}>
              You are about to {statusAction === "Returned" ? "Return" : statusAction} {selectedMembers.length} {selectedMembers.length === 1 ? 'record' : 'records'}.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "var(--primary-700)" }}>
                Verifier Remarks:
              </label>
              <textarea
                value={verifierRemarks}
                onChange={(e) => setVerifierRemarks(e.target.value)}
                placeholder="Enter remarks for this status change..."
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                className="pill"
                onClick={() => setShowStatusModal(false)}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pill"
                onClick={confirmStatusChange}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  backgroundColor: 
                    statusAction === "Approved" ? "#10b981" :
                    statusAction === "Returned" ? "#f97316" :
                    statusAction === "Rejected" ? "#ef4444" :
                    "var(--primary-500)",
                  color: "white"
                }}
              >
                {statusAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}

export default MemberMaintenance;


