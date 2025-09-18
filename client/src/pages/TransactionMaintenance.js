import React, { useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEdit3, FiTrash2, FiCheckCircle, FiClock, FiRotateCcw, FiXCircle } from "react-icons/fi";
import { FaPlus } from 'react-icons/fa';
import DashboardWrapper from '../components/DashboardWrapper';
import Pagination from '../components/Pagination';
import { useSnackbar } from "../helpers/SnackbarContext";
import { AuthContext } from "../helpers/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../helpers/PermissionUtils";
import frontendLoggingService from "../services/frontendLoggingService";

function TransactionMaintenance() {
  const history = useHistory();
  const { showMessage } = useSnackbar();
  const { authState, isLoading } = useContext(AuthContext);
  const { canAdd, canEdit, canDelete, canApprove } = usePermissions();

  useEffect(() => {
    // Only redirect if authentication check is complete and user is not authenticated
    if (!isLoading && !authState.status) {
      history.push("/login");
    } else if (!isLoading && authState.status) {
      // Log page view when user is authenticated
      frontendLoggingService.logView("Transaction", null, null, "Viewed Transaction Maintenance page");
    }
  }, [authState, isLoading, history]);

  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState("");
  const [verifierRemarks, setVerifierRemarks] = useState("");
  const [sortField] = useState("createdOn");
  const [sortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('q', search);
      
      const response = await axios.get(`http://localhost:3001/transactions?${params}`, {
        headers: { accessToken: localStorage.getItem("accessToken") }
      });
      setTransactions(response.data.entity || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showMessage("Failed to fetch transactions", "error");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, search]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    
    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.transactionId.toLowerCase().includes(searchLower) ||
        (t.remarks && t.remarks.toLowerCase().includes(searchLower)) ||
        (t.debitAccount && t.debitAccount.accountId.toLowerCase().includes(searchLower)) ||
        (t.creditAccount && t.creditAccount.accountId.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [transactions, statusFilter, search]);

  const sortedTransactions = useMemo(() => {
    const list = Array.isArray(filteredTransactions) ? filteredTransactions : [];
    return [...list].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (sortField === 'createdOn') {
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
  }, [filteredTransactions, sortField, sortDirection]);

  // Pagination logic
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTransactions(paginatedTransactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (transactionId, checked) => {
    if (checked) {
      setSelectedTransactions(prev => [...prev, transactionId]);
    } else {
      setSelectedTransactions(prev => prev.filter(id => id !== transactionId));
    }
  };

  const isAllSelected = selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0;
  const isIndeterminate = selectedTransactions.length > 0 && selectedTransactions.length < paginatedTransactions.length;

  // Show/hide batch actions based on selection
  useEffect(() => {
    setShowBatchActions(selectedTransactions.length > 0);
  }, [selectedTransactions]);

  // Status change functions
  const handleStatusChange = (action) => {
    setStatusAction(action);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      const promises = selectedTransactions.map(transactionId => 
        axios.put(`http://localhost:3001/transactions/${transactionId}`, {
          status: statusAction,
          verifierRemarks: verifierRemarks
        }, { 
          headers: { accessToken: localStorage.getItem("accessToken") } 
        })
      );
      
      await Promise.all(promises);
      
      // Update local state
      setTransactions(prev => prev.map(transaction => 
        selectedTransactions.includes(transaction.id) 
          ? { ...transaction, status: statusAction, verifierRemarks: verifierRemarks }
          : transaction
      ));
      
      showMessage(`${statusAction} ${selectedTransactions.length} transaction(s) successfully`, "success");
      setSelectedTransactions([]);
      setShowStatusModal(false);
      setVerifierRemarks("");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to update transaction status";
      showMessage(msg, "error");
    }
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`http://localhost:3001/transactions/${transactionId}`, {
          headers: { accessToken: localStorage.getItem("accessToken") }
        });
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        showMessage("Transaction deleted successfully", "success");
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to delete transaction";
        showMessage(msg, "error");
      }
    }
  };

  return (
    <DashboardWrapper>
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <h1 style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: "var(--text-primary)"
          }}>
            Transaction Maintenance
          </h1>
          {canAdd(PERMISSIONS.TRANSACTION_MAINTENANCE) ? (
            <button
              onClick={() => {
                frontendLoggingService.logButtonClick("Add Transaction", "Transaction", null, "Clicked Add Transaction button");
                history.push("/transaction/new");
              }}
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
                cursor: "pointer"
              }}
            >
              <FaPlus />
              Add Transaction
            </button>
          ) : (
            <button
              onClick={() => showMessage("Your role lacks permission to add transactions", "error")}
              style={{
                backgroundColor: "var(--muted-text)",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "not-allowed",
                opacity: 0.5
              }}
            >
              <FaPlus />
              Add Transaction
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            alignItems: "end"
          }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "var(--primary-700)"
              }}>
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by transaction ID, remarks..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "var(--primary-700)"
              }}>
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch Actions */}
        {showBatchActions && (
          <div style={{
            backgroundColor: "var(--primary-50)",
            border: "1px solid var(--primary-200)",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <p style={{
              margin: 0,
              color: "var(--primary-700)",
              fontWeight: "500"
            }}>
              {selectedTransactions.length} transaction{selectedTransactions.length === 1 ? '' : 's'} selected
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {canApprove(PERMISSIONS.TRANSACTION_MAINTENANCE) && (
                <>
                  <button
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
                    <FiCheckCircle style={{ marginRight: "4px" }} />
                    Approve
                  </button>
                  <button
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
                    <FiRotateCcw style={{ marginRight: "4px" }} />
                    Return
                  </button>
                  <button
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
                    <FiXCircle style={{ marginRight: "4px" }} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
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
                    Transaction ID
                    {sortField === 'transactionId' && (
                      <span style={{ marginLeft: '8px', color: 'var(--primary-500)' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>Debit Account</th>
                  <th>Credit Account</th>
                  <th>Amount</th>
                  <th>
                    Created On
                    {sortField === 'createdOn' && (
                      <span style={{ marginLeft: '8px', color: 'var(--primary-500)' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
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
                {paginatedTransactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(t.id)}
                        onChange={(e) => handleSelectTransaction(t.id, e.target.checked)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td style={{ fontFamily: "monospace", fontWeight: "600" }}>
                      {t.transactionId}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: "500" }}>
                          {t.debitAccount ? t.debitAccount.accountId : 'N/A'}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--muted-text)" }}>
                          {t.debitAccount && t.debitAccount.member 
                            ? `${t.debitAccount.member.firstName} ${t.debitAccount.member.lastName}`
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: "500" }}>
                          {t.creditAccount ? t.creditAccount.accountId : 'N/A'}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--muted-text)" }}>
                          {t.creditAccount && t.creditAccount.member 
                            ? `${t.creditAccount.member.firstName} ${t.creditAccount.member.lastName}`
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontWeight: "600" }}>
                      ${parseFloat(t.amount).toFixed(2)}
                    </td>
                    <td>{t.createdOn ? new Date(t.createdOn).toLocaleDateString() : '-'}</td>
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
                            t.status === "Approved" ? "rgba(16, 185, 129, 0.2)" :
                            t.status === "Pending" ? "rgba(6, 182, 212, 0.2)" :
                            t.status === "Returned" ? "rgba(249, 115, 22, 0.2)" :
                            t.status === "Rejected" ? "rgba(239, 68, 68, 0.2)" :
                            "rgba(107, 114, 128, 0.2)",
                          color:
                            t.status === "Approved" ? "#059669" :
                            t.status === "Pending" ? "#0891b2" :
                            t.status === "Returned" ? "#ea580c" :
                            t.status === "Rejected" ? "#dc2626" :
                            "#6b7280",
                          border: `1px solid ${
                            t.status === "Approved" ? "rgba(16, 185, 129, 0.3)" :
                            t.status === "Pending" ? "rgba(6, 182, 212, 0.3)" :
                            t.status === "Returned" ? "rgba(249, 115, 22, 0.3)" :
                            t.status === "Rejected" ? "rgba(239, 68, 68, 0.3)" :
                            "rgba(107, 114, 128, 0.3)"
                          }`
                        }}
                      >
                        {t.status}
                      </div>
                    </td>
                    <td className="actions">
                      <button className="action-btn action-btn--view" onClick={() => {
                        frontendLoggingService.logView("Transaction", t.id, t.transactionId, "Viewed transaction details");
                        history.push(`/transaction/${t.id}`);
                      }} title="View">
                        <FiEye />
                      </button>
                      {canEdit(PERMISSIONS.TRANSACTION_MAINTENANCE) ? (
                        <button className="action-btn action-btn--edit" onClick={() => {
                          frontendLoggingService.logButtonClick("Edit Transaction", "Transaction", t.id, `Clicked Edit button for transaction: ${t.transactionId}`);
                          history.push(`/transaction/${t.id}?edit=1`);
                        }} title="Update">
                          <FiEdit3 />
                        </button>
                      ) : (
                        <button 
                          className="action-btn action-btn--edit" 
                          onClick={() => showMessage("Your role lacks permission to edit transactions", "error")} 
                          title="Update - No Permission"
                          style={{ opacity: 0.5, cursor: "not-allowed" }}
                          disabled
                        >
                          <FiEdit3 />
                        </button>
                      )}
                      {canDelete(PERMISSIONS.TRANSACTION_MAINTENANCE) ? (
                        <button className="action-btn action-btn--delete" onClick={() => {
                          frontendLoggingService.logButtonClick("Delete Transaction", "Transaction", t.id, `Clicked Delete button for transaction: ${t.transactionId}`);
                          handleDelete(t.id);
                        }} title="Delete">
                          <FiTrash2 />
                        </button>
                      ) : (
                        <button 
                          className="action-btn action-btn--delete" 
                          onClick={() => showMessage("Your role lacks permission to delete transactions", "error")} 
                          title="Delete - No Permission"
                          style={{ opacity: 0.5, cursor: "not-allowed" }}
                          disabled
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={sortedTransactions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        {/* Status Change Modal */}
        {showStatusModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div 
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                width: "90%",
                maxWidth: "500px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical",
                fontFamily: "inherit"
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary-700)" }}>
                Change Status to {statusAction}
              </h3>
              <p style={{ marginBottom: "20px", color: "var(--muted-text)" }}>
                This will change the status of {selectedTransactions.length} selected transaction{selectedTransactions.length === 1 ? '' : 's'}.
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
      </div>
    </DashboardWrapper>
  );
}

export default TransactionMaintenance;
