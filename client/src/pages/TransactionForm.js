import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { useSnackbar } from "../helpers/SnackbarContext";
import { AuthContext } from "../helpers/AuthContext";
import DashboardWrapper from '../components/DashboardWrapper';
import SaccoLookupModal from '../components/SaccoLookupModal';
import AccountLookupModal from '../components/AccountLookupModal';

function TransactionForm() {
  const history = useHistory();
  const { authState, isLoading } = useContext(AuthContext);
  const { id } = useParams();
  const { search } = useLocation();
  const { showMessage } = useSnackbar();
  const isEdit = new URLSearchParams(search).get("edit") === "1";
  const isCreate = id === "new";

  const [form, setForm] = useState({
    transactionId: "",
    saccoId: "",
    saccoName: "",
    debitAccountId: "",
    debitAccountName: "",
    creditAccountId: "",
    creditAccountName: "",
    amount: "",
    status: "Pending",
    remarks: "",
    createdBy: "",
    createdOn: "",
    modifiedBy: "",
    modifiedOn: "",
    approvedBy: "",
    approvedOn: "",
  });

  // Modal states
  const [isSaccoModalOpen, setIsSaccoModalOpen] = useState(false);
  const [isDebitAccountModalOpen, setIsDebitAccountModalOpen] = useState(false);
  const [isCreditAccountModalOpen, setIsCreditAccountModalOpen] = useState(false);

  useEffect(() => {
    // Only redirect if authentication check is complete and user is not authenticated
    if (!isLoading && !authState.status) {
      history.push("/login");
    }
  }, [authState, isLoading, history]);

  // Generate Transaction ID for new transactions
  const generateTransactionId = () => {
    const randomNum = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
    return `T-${randomNum}`;
  };

  useEffect(() => {
    const load = async () => {
      if (!isCreate) {
        const res = await axios.get(`http://localhost:3001/transactions/${id}`, {
          headers: { accessToken: localStorage.getItem("accessToken") },
        });
        const data = res.data?.entity || res.data;
        setForm({
          transactionId: data.transactionId || "",
          saccoId: data.saccoId || "",
          saccoName: data.sacco ? data.sacco.saccoName : "",
          debitAccountId: data.debitAccountId || "",
          debitAccountName: data.debitAccount ? `${data.debitAccount.accountName} (${data.debitAccount.accountId})` : "",
          creditAccountId: data.creditAccountId || "",
          creditAccountName: data.creditAccount ? `${data.creditAccount.accountName} (${data.creditAccount.accountId})` : "",
          amount: data.amount || "",
          status: data.status || "Pending",
          remarks: data.remarks || "",
          createdBy: data.createdBy || "",
          createdOn: data.createdOn || "",
          modifiedBy: data.modifiedBy || "",
          modifiedOn: data.modifiedOn || "",
          approvedBy: data.approvedBy || "",
          approvedOn: data.approvedOn || "",
        });
      } else {
        // Generate Transaction ID for new transactions
        setForm(prev => ({ ...prev, transactionId: generateTransactionId() }));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isCreate]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // Remove display fields that shouldn't be sent to backend
      delete payload.saccoName;
      delete payload.debitAccountName;
      delete payload.creditAccountName;
      
      if (isCreate) {
        await axios.post("http://localhost:3001/transactions", payload, { headers: { accessToken: localStorage.getItem("accessToken") } });
        showMessage("Transaction created successfully", "success");
      } else {
        await axios.put(`http://localhost:3001/transactions/${id}`, payload, { headers: { accessToken: localStorage.getItem("accessToken") } });
        showMessage("Transaction updated successfully", "success");
      }
      history.push("/transactions");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save transaction";
      showMessage(msg, "error");
    }
  };

  const handleSaccoSelect = (sacco) => {
    setForm(prev => ({
      ...prev,
      saccoId: sacco.saccoId,
      saccoName: sacco.saccoName
    }));
  };

  const handleDebitAccountSelect = (account) => {
    setForm(prev => ({
      ...prev,
      debitAccountId: account.id,
      debitAccountName: `${account.accountName} (${account.accountId})`
    }));
  };

  const handleCreditAccountSelect = (account) => {
    setForm(prev => ({
      ...prev,
      creditAccountId: account.id,
      creditAccountName: `${account.accountName} (${account.accountId})`
    }));
  };

  return (
    <DashboardWrapper>
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px"
        }}>
          <button
            onClick={() => history.goBack()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)"
            }}
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: "var(--text-primary)"
          }}>
            {isCreate ? "Create Transaction" : isEdit ? "Edit Transaction" : "View Transaction"}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={save} style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "24px"
          }}>
            {/* Transaction ID */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "var(--primary-700)"
              }}>
                Transaction ID
              </label>
              <input
                type="text"
                value={form.transactionId}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "var(--gray-50)",
                  color: "var(--muted-text)"
                }}
              />
            </div>

            {/* Sacco ID */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "var(--primary-700)"
              }}>
                SACCO *
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={form.saccoName}
                  readOnly
                  placeholder="Select SACCO"
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "var(--gray-50)",
                    color: "var(--muted-text)"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsSaccoModalOpen(true)}
                  disabled={!isCreate && !isEdit}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "var(--primary-500)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: (isCreate || isEdit) ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "500",
                    opacity: (isCreate || isEdit) ? 1 : 0.5
                  }}
                >
                  Select
                </button>
              </div>
            </div>

            {/* Debit Account */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "var(--primary-700)"
              }}>
                Debit Account *
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={form.debitAccountName}
                  readOnly
                  placeholder="Select Debit Account"
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "var(--gray-50)",
                    color: "var(--muted-text)"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsDebitAccountModalOpen(true)}
                  disabled={!isCreate && !isEdit}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "var(--primary-500)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: (isCreate || isEdit) ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "500",
                    opacity: (isCreate || isEdit) ? 1 : 0.5
                  }}
                >
                  Select
                </button>
              </div>
            </div>

            {/* Credit Account */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "var(--primary-700)"
              }}>
                Credit Account *
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={form.creditAccountName}
                  readOnly
                  placeholder="Select Credit Account"
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "var(--gray-50)",
                    color: "var(--muted-text)"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsCreditAccountModalOpen(true)}
                  disabled={!isCreate && !isEdit}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "var(--primary-500)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: (isCreate || isEdit) ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "500",
                    opacity: (isCreate || isEdit) ? 1 : 0.5
                  }}
                >
                  Select
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "var(--primary-700)"
              }}>
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                disabled={!isCreate && !isEdit}
                placeholder="Enter amount"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: (isCreate || isEdit) ? "white" : "var(--gray-50)",
                  color: (isCreate || isEdit) ? "var(--text-primary)" : "var(--muted-text)"
                }}
              />
            </div>

            {/* Status */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "var(--primary-700)"
              }}>
                Status
              </label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                disabled={!isCreate && !isEdit}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: (isCreate || isEdit) ? "white" : "var(--gray-50)",
                  color: (isCreate || isEdit) ? "var(--text-primary)" : "var(--muted-text)"
                }}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "var(--primary-700)"
            }}>
              Remarks
            </label>
            <textarea
              value={form.remarks}
              onChange={e => setForm({ ...form, remarks: e.target.value })}
              disabled={!isCreate && !isEdit}
              placeholder="Enter transaction remarks..."
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                fontSize: "14px",
                resize: "vertical",
                backgroundColor: (isCreate || isEdit) ? "white" : "var(--gray-50)",
                color: (isCreate || isEdit) ? "var(--text-primary)" : "var(--muted-text)"
              }}
            />
          </div>

          {/* Action Buttons */}
          {(isCreate || isEdit) && (
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end"
            }}>
              <button
                type="button"
                onClick={() => history.goBack()}
                style={{
                  padding: "12px 24px",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "var(--primary-500)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                {isCreate ? "Create Transaction" : "Update Transaction"}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Modals */}
      <SaccoLookupModal
        isOpen={isSaccoModalOpen}
        onClose={() => setIsSaccoModalOpen(false)}
        onSelectSacco={handleSaccoSelect}
      />

      <AccountLookupModal
        isOpen={isDebitAccountModalOpen}
        onClose={() => setIsDebitAccountModalOpen(false)}
        onSelectAccount={handleDebitAccountSelect}
      />

      <AccountLookupModal
        isOpen={isCreditAccountModalOpen}
        onClose={() => setIsCreditAccountModalOpen(false)}
        onSelectAccount={handleCreditAccountSelect}
      />
    </DashboardWrapper>
  );
}

export default TransactionForm;
