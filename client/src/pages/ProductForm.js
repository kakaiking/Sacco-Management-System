import React, { useEffect, useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiTrash2, FiX } from "react-icons/fi";
import axios from "axios";
import { useSnackbar } from "../helpers/SnackbarContext";
import DashboardWrapper from '../components/DashboardWrapper';

function ProductForm() {
  const history = useHistory();
  const { id } = useParams();
  const { search } = useLocation();
  const { showMessage } = useSnackbar();
  const isEdit = new URLSearchParams(search).get("edit") === "1";
  const isCreate = id === "new";

  const [form, setForm] = useState({
    productId: "",
    productName: "",
    productStatus: "Pending",
    currency: "",
    isCreditInterest: false,
    isDebitInterest: false,
    interestType: "",
    interestCalculationRule: "",
    interestFrequency: "",
    appliedOnMemberOnboarding: false,
    createdBy: "",
    createdOn: "",
    modifiedBy: "",
    modifiedOn: "",
    approvedBy: "",
    approvedOn: "",
    status: "Pending",
  });

  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      history.push("/login");
    }
  }, [history]);

  // Generate product ID for new products
  const generateProductId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
    return `P-${randomNum}`;
  };

  useEffect(() => {
    const load = async () => {
      if (!isCreate) {
        const res = await axios.get(`http://localhost:3001/products/${id}`, {
          headers: { accessToken: localStorage.getItem("accessToken") },
        });
        const data = res.data?.entity || res.data;
        setForm({
          productId: data.productId || "",
          productName: data.productName || "",
          productStatus: data.productStatus || "Pending",
          currency: data.currency || "",
          isCreditInterest: data.isCreditInterest || false,
          isDebitInterest: data.isDebitInterest || false,
          interestType: data.interestType || "",
          interestCalculationRule: data.interestCalculationRule || "",
          interestFrequency: data.interestFrequency || "",
          appliedOnMemberOnboarding: data.appliedOnMemberOnboarding || false,
          createdBy: data.createdBy || "",
          createdOn: data.createdOn || "",
          modifiedBy: data.modifiedBy || "",
          modifiedOn: data.modifiedOn || "",
          approvedBy: data.approvedBy || "",
          approvedOn: data.approvedOn || "",
          status: data.status || "Pending",
        });
      } else {
        // Generate product ID for new products
        setForm(prev => ({ ...prev, productId: generateProductId() }));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isCreate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        modifiedBy: localStorage.getItem("username") || "System",
        modifiedOn: new Date().toISOString(),
      };

      if (isCreate) {
        payload.createdBy = localStorage.getItem("username") || "System";
        payload.createdOn = new Date().toISOString();
        const res = await axios.post("http://localhost:3001/products", payload, {
          headers: { accessToken: localStorage.getItem("accessToken") },
        });
        showMessage("Product created successfully", "success");
        history.push("/product-maintenance");
      } else {
        await axios.put(`http://localhost:3001/products/${id}`, payload, {
          headers: { accessToken: localStorage.getItem("accessToken") },
        });
        showMessage("Product updated successfully", "success");
        history.push("/product-maintenance");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to save product";
      showMessage(msg, "error");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:3001/products/${id}`, {
          headers: { accessToken: localStorage.getItem("accessToken") },
        });
        showMessage("Product deleted successfully", "success");
        history.push("/product-maintenance");
      } catch (err) {
        const msg = err?.response?.data?.error || "Failed to delete product";
        showMessage(msg, "error");
      }
    }
  };

  return (
    <DashboardWrapper>
      <header className="header">
        <div className="header__left">
          <button className="iconBtn"
            onClick={() => history.push("/product-maintenance")}
            style={{

              marginRight: "8px"
            }}
          >
            <FiArrowLeft />
          </button>
          <div className="greeting">{isCreate ? "Add Product" : (isEdit ? "Update Product Details" : "View Product Details")}</div>

        </div>

      </header>

      <main className="dashboard__content">
        <section className="card" style={{ padding: "24px" }}>
          <form onSubmit={handleSubmit}>
            {/* Product ID, Name, and Status - Non-changeable and automatic */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "20px",
              marginBottom: "12px",
              alignItems: "start"
            }}>
              <div style={{ display: "grid", gap: "12px" }}>
                <label>
                  Product Id
                  <input className="inputa"
                    value={form.productId}
                    onChange={e => setForm({ ...form, productId: e.target.value })}
                    required
                    disabled={true}
                  />
                </label>
                <label>
                  Product Name
                  <input
                    className="inputa"
                    value={`${form.productName}`.trim()}
                    disabled={true}
                    placeholder="Auto-generated"
                  />
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontWeight: "600", color: "var(--primary-700)", minWidth: "60px" }}>
                    Status:
                  </span>
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
                        form.status === "Approved" ? "rgba(16, 185, 129, 0.2)" :
                          form.status === "Pending" ? "rgba(6, 182, 212, 0.2)" :
                            form.status === "Returned" ? "rgba(249, 115, 22, 0.2)" :
                              form.status === "Rejected" ? "rgba(239, 68, 68, 0.2)" :
                                "rgba(107, 114, 128, 0.2)",
                      color:
                        form.status === "Approved" ? "#059669" :
                          form.status === "Pending" ? "#0891b2" :
                            form.status === "Returned" ? "#ea580c" :
                              form.status === "Rejected" ? "#dc2626" :
                                "#6b7280",
                      border: `1px solid ${form.status === "Approved" ? "rgba(16, 185, 129, 0.3)" :
                        form.status === "Pending" ? "rgba(6, 182, 212, 0.3)" :
                          form.status === "Returned" ? "rgba(249, 115, 22, 0.3)" :
                            form.status === "Rejected" ? "rgba(239, 68, 68, 0.3)" :
                              "rgba(107, 114, 128, 0.3)"
                        }`
                    }}
                  >
                    {form.status || "Pending"}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "24px",
              backgroundColor: "var(--surface-2)",
              borderRadius: "8px",
              padding: "4px"
            }}>
              <div
                onClick={() => setActiveTab("details")}
                style={{
                  padding: "12px 24px",
                  color: activeTab === "details" ? "#007bff" : "#666",
                  cursor: "pointer",
                  fontWeight: activeTab === "details" ? "600" : "400",
                  background: activeTab === "details" ? "#e3f2fd" : "transparent",
                  border: "1px solid transparent",
                  borderRadius: "6px",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
              >
                Details
              </div>
              <div
                onClick={() => setActiveTab("additional")}
                style={{
                  padding: "12px 24px",
                  color: activeTab === "additional" ? "#007bff" : "#666",
                  cursor: "pointer",
                  fontWeight: activeTab === "additional" ? "600" : "400",
                  background: activeTab === "additional" ? "#e3f2fd" : "transparent",
                  border: "1px solid transparent",
                  borderRadius: "6px",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
              >
                Additional Info
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "details" && (
              <div>
                <div className="grid2">
                  <label>
                    Currency
                    <input
                      className="input"
                      value={form.currency}
                      onChange={e => setForm({ ...form, currency: e.target.value })}
                      disabled={!isCreate && !isEdit}
                      required
                    />
                  </label>

                  {/* Interest Configuration Fields */}
                  <label>
                    Interest Type
                    <select
                      className="input"
                      value={form.interestType}
                      onChange={e => setForm({ ...form, interestType: e.target.value })}
                      disabled={!isCreate && !isEdit}
                    >
                      <option value="">Select Interest Type</option>
                      <option value="Fixed Rate">Fixed Rate</option>
                      <option value="Variable Rate">Variable Rate</option>
                    </select>
                  </label>
                  <label>
                    Interest Calculation Rule
                    <select
                      className="input"
                      value={form.interestCalculationRule}
                      onChange={e => setForm({ ...form, interestCalculationRule: e.target.value })}
                      disabled={!isCreate && !isEdit}
                    >
                      <option value="">Select Calculation Rule</option>
                      <option value="Reducing Balance">Reducing Balance</option>
                      <option value="Flat Rate">Flat Rate</option>
                      <option value="Compound Interest">Compound Interest</option>
                      <option value="Simple Interest">Simple Interest</option>
                    </select>
                  </label>

                  <label>
                    Interest Frequency
                    <select
                      className="input"
                      value={form.interestFrequency}
                      onChange={e => setForm({ ...form, interestFrequency: e.target.value })}
                      disabled={!isCreate && !isEdit}
                    >
                      <option value="">Select Frequency</option>
                      <option value="Daily">Daily</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Semi-Annually">Semi-Annually</option>
                      <option value="Annually">Annually</option>
                      <option value="At Maturity">At Maturity</option>
                    </select>
                  </label>
                </div>


                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                  <button
                    type="button"
                    className="pill"
                    onClick={() => setActiveTab("additional")}
                    style={{
                      padding: "8px 16px",
                      fontSize: "14px"
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {activeTab === "additional" && (
              <div>
                {/* Interest Type Radio Buttons - Centered */}
                <div style={{ 
                  marginBottom: "32px", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <h4 style={{ marginBottom: "12px", color: "var(--primary-700)", textAlign: "center" }}>Interest Configuration</h4>
                  <div style={{ display: "flex", gap: "48px", justifyContent: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="interestType"
                        checked={form.isCreditInterest}
                        onChange={() => setForm({
                          ...form,
                          isCreditInterest: true,
                          isDebitInterest: false
                        })}
                        disabled={!isCreate && !isEdit}
                        style={{ transform: "scale(1.2)" }}
                      />
                      <span>Is Credit Interest (for savings products)</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="interestType"
                        checked={form.isDebitInterest}
                        onChange={() => setForm({
                          ...form,
                          isCreditInterest: false,
                          isDebitInterest: true
                        })}
                        disabled={!isCreate && !isEdit}
                        style={{ transform: "scale(1.2)" }}
                      />
                      <span>Is Debit Interest (for loans)</span>
                    </label>
                  </div>
                </div>

                {/* Member Onboarding Checkbox - Centered */}
                <div style={{ 
                  marginBottom: "20px", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flexDirection: "column"
                }}>
                  <h4 style={{ marginBottom: "12px", color: "var(--primary-700)", textAlign: "center" }}>Member Onboarding</h4>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.appliedOnMemberOnboarding}
                      onChange={e => setForm({ ...form, appliedOnMemberOnboarding: e.target.checked })}
                      disabled={!isCreate && !isEdit}
                      style={{ transform: "scale(1.2)" }}
                    />
                    <span>Applied on Member Onboarding</span>
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "24px" }}>
                  <button
                    type="button"
                    className="pill"
                    onClick={() => setActiveTab("details")}
                    style={{
                      padding: "8px 16px",
                      fontSize: "14px"
                    }}
                  >
                    Back
                  </button>
                  {(isCreate || isEdit) && (
                    <button
                      type="submit"
                      className="pill"
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        backgroundColor: "var(--primary-500)",
                        color: "white",
                        border: "none"
                      }}
                    >
                      {isCreate ? "Add Product" : "Update Product"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Audit Fields Section */}
            <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginTop: "16px"
            }}>

              <label>
                Created On
                <input className="inputf"
                  value={form.createdOn ? new Date(form.createdOn).toLocaleDateString() : ""}
                  disabled={true}
                />
              </label>

              <label>
                Modified On
                <input className="inputf"
                  value={form.modifiedOn ? new Date(form.modifiedOn).toLocaleDateString() : ""}
                  disabled={true}
                />
              </label>

              <label>
                Approved On
                <input className="inputf"
                  value={form.approvedOn ? new Date(form.approvedOn).toLocaleDateString() : ""}
                  disabled={true}
                />
              </label>

              <label>
                Created By
                <input className="inputf"
                  value={form.createdBy || ""}
                  disabled={true}
                />
              </label>

              <label>
                Modified By
                <input className="inputf"
                  value={form.modifiedBy || ""}
                  disabled={true}
                />
              </label>

              <label>
                Approved By
                <input className="inputf"
                  value={form.approvedBy || ""}
                  disabled={true}
                />
              </label>

            </div>

          </form>
        </section>
      </main>
    </DashboardWrapper>
  );
}

export default ProductForm;
