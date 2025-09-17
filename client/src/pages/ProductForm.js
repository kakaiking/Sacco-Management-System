import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import axios from "axios";
import { useSnackbar } from "../helpers/SnackbarContext";
import { AuthContext } from "../helpers/AuthContext";
import DashboardWrapper from '../components/DashboardWrapper';
import CurrencyLookupModal from '../components/CurrencyLookupModal';
import SaccoLookupModal from '../components/SaccoLookupModal';
import ChargesLookupModal from '../components/ChargesLookupModal';

function ProductForm() {
  const history = useHistory();
  const { authState, isLoading } = useContext(AuthContext);
  const { id } = useParams();
  const { search } = useLocation();
  const { showMessage } = useSnackbar();
  const isEdit = new URLSearchParams(search).get("edit") === "1";
  const isCreate = id === "new";

  const [form, setForm] = useState({
    productId: "",
    productName: "",
    saccoId: "",
    chargeIds: "",
    currency: "",
    interestRate: "",
    interestType: "",
    interestCalculationRule: "",
    interestFrequency: "",
    isCreditInterest: false,
    isDebitInterest: false,
    needGuarantors: false,
    maxGuarantors: "",
    minGuarantors: "",
    isSpecial: false,
    maxSpecialUsers: "",
    appliedOnMemberOnboarding: false,
    productStatus: "Pending",
    status: "Pending",
    createdBy: "",
    createdOn: "",
    modifiedBy: "",
    modifiedOn: "",
    approvedBy: "",
    approvedOn: "",
  });

  const [activeTab, setActiveTab] = useState("details");

  // Currency lookup modal state
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  
  // Sacco lookup modal state
  const [isSaccoModalOpen, setIsSaccoModalOpen] = useState(false);
  
  // Charges lookup modal state
  const [isChargesModalOpen, setIsChargesModalOpen] = useState(false);
  const [selectedCharges, setSelectedCharges] = useState([]);

  useEffect(() => {
    // Only redirect if authentication check is complete and user is not authenticated
    if (!isLoading && !authState.status) {
      history.push("/login");
    }
  }, [authState, isLoading, history]);

  // Generate product ID for new products
  const generateProductId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
    return `P-${randomNum}`;
  };

  // Load existing charges by their IDs
  const loadExistingCharges = async (chargeIds) => {
    if (!chargeIds || chargeIds.length === 0) {
      setSelectedCharges([]);
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/charges', {
        headers: { accessToken: localStorage.getItem('accessToken') }
      });
      
      const allCharges = response.data.entity || [];
      const matchingCharges = allCharges.filter(charge => 
        chargeIds.includes(charge.chargeId)
      );
      
      setSelectedCharges(matchingCharges);
    } catch (error) {
      console.error('Error loading existing charges:', error);
      setSelectedCharges([]);
    }
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
          saccoId: data.saccoId || "",
          chargeIds: data.chargeIds || "",
          currency: data.currency || "",
          interestRate: data.interestRate || "",
          interestType: data.interestType || "",
          interestCalculationRule: data.interestCalculationRule || "",
          interestFrequency: data.interestFrequency || "",
          isCreditInterest: data.isCreditInterest || false,
          isDebitInterest: data.isDebitInterest || false,
          needGuarantors: data.needGuarantors || false,
          maxGuarantors: data.maxGuarantors || "",
          minGuarantors: data.minGuarantors || "",
          isSpecial: data.isSpecial || false,
          maxSpecialUsers: data.maxSpecialUsers || "",
          appliedOnMemberOnboarding: data.appliedOnMemberOnboarding || false,
          productStatus: data.productStatus || "Pending",
          status: data.status || "Pending",
          createdBy: data.createdBy || "",
          createdOn: data.createdOn || "",
          modifiedBy: data.modifiedBy || "",
          modifiedOn: data.modifiedOn || "",
          approvedBy: data.approvedBy || "",
          approvedOn: data.approvedOn || "",
        });
        
        // Parse existing charge IDs if they exist
        if (data.chargeIds) {
          const chargeIdArray = data.chargeIds.split(',').map(id => id.trim()).filter(id => id);
          // Fetch the actual charge objects
          loadExistingCharges(chargeIdArray);
        }
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
        await axios.post("http://localhost:3001/products", payload, {
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

  // Currency lookup modal handlers
  const handleOpenCurrencyModal = () => {
    setIsCurrencyModalOpen(true);
  };

  const handleCloseCurrencyModal = () => {
    setIsCurrencyModalOpen(false);
  };

  const handleSelectCurrency = (selectedCurrency) => {
    setForm(prev => ({ ...prev, currency: selectedCurrency.currencyCode }));
    setIsCurrencyModalOpen(false);
  };

  // Sacco lookup modal handlers
  const handleOpenSaccoModal = () => {
    setIsSaccoModalOpen(true);
  };

  const handleCloseSaccoModal = () => {
    setIsSaccoModalOpen(false);
  };

  const handleSelectSacco = (selectedSacco) => {
    setForm(prev => ({ ...prev, saccoId: selectedSacco.saccoId }));
    setIsSaccoModalOpen(false);
  };

  // Charges lookup modal handlers
  const handleOpenChargesModal = () => {
    setIsChargesModalOpen(true);
  };

  const handleCloseChargesModal = () => {
    setIsChargesModalOpen(false);
  };

  const handleSelectCharges = (charges) => {
    setSelectedCharges(charges);
    // Convert charges array to comma-separated string for the form
    const chargeIds = charges.map(charge => charge.chargeId).join(', ');
    setForm(prev => ({ ...prev, chargeIds }));
    setIsChargesModalOpen(false);
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
                    value={form.productName}
                    onChange={e => setForm({ ...form, productName: e.target.value })}
                    disabled={!isCreate && !isEdit}
                    placeholder="Enter product name"
                    required
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
                    Sacco ID
                    <div className="role-input-wrapper">
                      <input
                        type="text"
                        className="input"
                        value={form.saccoId}
                        onChange={e => setForm({ ...form, saccoId: e.target.value })}
                        disabled={!isCreate && !isEdit}
                        placeholder="Select a sacco"
                        readOnly={!isCreate && !isEdit}
                      />
                      {(isCreate || isEdit) && (
                        <button
                          type="button"
                          className="role-search-btn"
                          onClick={handleOpenSaccoModal}
                          title="Search saccos"
                        >
                          <FiSearch />
                        </button>
                      )}
                    </div>
                  </label>

                  <label>
                    Currency
                    <div className="role-input-wrapper">
                      <input
                        type="text"
                        className="input"
                        value={form.currency}
                        onChange={e => setForm({ ...form, currency: e.target.value })}
                        disabled={!isCreate && !isEdit}
                        required
                        placeholder="Select a currency"
                        readOnly={!isCreate && !isEdit}
                      />
                      {(isCreate || isEdit) && (
                        <button
                          type="button"
                          className="role-search-btn"
                          onClick={handleOpenCurrencyModal}
                          title="Search currencies"
                        >
                          <FiSearch />
                        </button>
                      )}
                    </div>
                  </label>

                  <label>
                    Interest Rate (%)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      className="input"
                      value={form.interestRate}
                      onChange={e => setForm({ ...form, interestRate: e.target.value })}
                      disabled={!isCreate && !isEdit}
                      placeholder="e.g., 12.5"
                    />
                  </label>

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

                  <label>
                    Charge IDs
                    <div className="role-input-wrapper">
                      <input
                        type="text"
                        className="input"
                        value={form.chargeIds}
                        onChange={e => setForm({ ...form, chargeIds: e.target.value })}
                        disabled={!isCreate && !isEdit}
                        placeholder="Select charges"
                        readOnly={!isCreate && !isEdit}
                      />
                      {(isCreate || isEdit) && (
                        <button
                          type="button"
                          className="role-search-btn"
                          onClick={handleOpenChargesModal}
                          title="Search charges"
                        >
                          <FiSearch />
                        </button>
                      )}
                    </div>
                    {selectedCharges.length > 0 && (
                      <div style={{ 
                        marginTop: '8px', 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '6px' 
                      }}>
                        {selectedCharges.map(charge => (
                          <span
                            key={charge.chargeId}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              border: '1px solid #0ea5e9'
                            }}
                          >
                            {charge.chargeId} - {charge.name}
                          </span>
                        ))}
                      </div>
                    )}
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

                {/* Guarantor Configuration */}
                <div style={{ 
                  marginBottom: "32px", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <h4 style={{ marginBottom: "12px", color: "var(--primary-700)", textAlign: "center" }}>Guarantor Configuration</h4>
                  <div style={{ display: "flex", gap: "24px", justifyContent: "center", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.needGuarantors}
                        onChange={e => setForm({ ...form, needGuarantors: e.target.checked })}
                        disabled={!isCreate && !isEdit}
                        style={{ transform: "scale(1.2)" }}
                      />
                      <span>Need Guarantors</span>
                    </label>
                  </div>
                  
                  {form.needGuarantors && (
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "12px", color: "#666" }}>Min Guarantors</span>
                        <input
                          type="number"
                          min="0"
                          className="input"
                          value={form.minGuarantors}
                          onChange={e => setForm({ ...form, minGuarantors: e.target.value })}
                          disabled={!isCreate && !isEdit}
                          style={{ width: "100px" }}
                        />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "12px", color: "#666" }}>Max Guarantors</span>
                        <input
                          type="number"
                          min="0"
                          className="input"
                          value={form.maxGuarantors}
                          onChange={e => setForm({ ...form, maxGuarantors: e.target.value })}
                          disabled={!isCreate && !isEdit}
                          style={{ width: "100px" }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Special Product Configuration */}
                <div style={{ 
                  marginBottom: "32px", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <h4 style={{ marginBottom: "12px", color: "var(--primary-700)", textAlign: "center" }}>Special Product Configuration</h4>
                  <div style={{ display: "flex", gap: "24px", justifyContent: "center", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.isSpecial}
                        onChange={e => setForm({ ...form, isSpecial: e.target.checked })}
                        disabled={!isCreate && !isEdit}
                        style={{ transform: "scale(1.2)" }}
                      />
                      <span>Is Special Product</span>
                    </label>
                  </div>
                  
                  {form.isSpecial && (
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "12px", color: "#666" }}>Max Special Users</span>
                        <input
                          type="number"
                          min="0"
                          className="input"
                          value={form.maxSpecialUsers}
                          onChange={e => setForm({ ...form, maxSpecialUsers: e.target.value })}
                          disabled={!isCreate && !isEdit}
                          style={{ width: "120px" }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Member Onboarding Configuration */}
                <div style={{ 
                  marginBottom: "20px", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <h4 style={{ marginBottom: "12px", color: "var(--primary-700)", textAlign: "center" }}>Member Onboarding</h4>
                  <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
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

      {/* Currency Lookup Modal */}
      <CurrencyLookupModal
        isOpen={isCurrencyModalOpen}
        onClose={handleCloseCurrencyModal}
        onSelectCurrency={handleSelectCurrency}
      />

      {/* Sacco Lookup Modal */}
      <SaccoLookupModal
        isOpen={isSaccoModalOpen}
        onClose={handleCloseSaccoModal}
        onSelectSacco={handleSelectSacco}
      />

      {/* Charges Lookup Modal */}
      <ChargesLookupModal
        isOpen={isChargesModalOpen}
        onClose={handleCloseChargesModal}
        onSelectCharges={handleSelectCharges}
        selectedChargeIds={selectedCharges.map(charge => charge.chargeId)}
      />
    </DashboardWrapper>
  );
}

export default ProductForm;
