import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiSearch } from 'react-icons/fi';
import axios from 'axios';

function AccountLookupModal({ isOpen, onClose, onSelectAccount }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Fetch accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  // Fetch accounts when search term changes
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        fetchAccounts();
      }, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, isOpen]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `http://localhost:3001/accounts?q=${encodeURIComponent(searchTerm)}`
        : 'http://localhost:3001/accounts';
      
      const response = await axios.get(url, {
        headers: { accessToken: localStorage.getItem('accessToken') }
      });
      setAccounts(response.data.entity || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleConfirmSelection = () => {
    if (selectedAccount) {
      onSelectAccount(selectedAccount);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            margin: 0,
            color: 'var(--primary-700)',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Select Account
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--muted-text)',
              padding: '4px'
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: '20px'
        }}>
          <FiSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted-text)',
            fontSize: '16px'
          }} />
          <input
            type="text"
            placeholder="Search by member name, member ID, or account number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Accounts List */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid var(--border)',
          borderRadius: '8px'
        }}>
          {loading ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--muted-text)'
            }}>
              Loading accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--muted-text)'
            }}>
              {searchTerm ? 'No accounts found matching your search.' : 'No accounts available.'}
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  onClick={() => handleAccountSelect(account)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    backgroundColor: selectedAccount?.id === account.id ? 'var(--primary-50)' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAccount?.id !== account.id) {
                      e.target.style.backgroundColor = 'var(--gray-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAccount?.id !== account.id) {
                      e.target.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: 'var(--primary-700)',
                          fontSize: '14px'
                        }}>
                          {account.accountId}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: 'var(--muted-text)',
                          backgroundColor: 'var(--gray-100)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {account.accountNumber}
                        </span>
                      </div>
                      
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        marginBottom: '4px'
                      }}>
                        {account.accountName}
                      </div>
                      
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--muted-text)',
                        marginBottom: '2px'
                      }}>
                        Member: {account.member ? `${account.member.firstName} ${account.member.lastName}` : 'N/A'}
                        {account.member && (
                          <span style={{ marginLeft: '8px', color: 'var(--primary-500)' }}>
                            ({account.member.memberNo})
                          </span>
                        )}
                      </div>
                      
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--muted-text)'
                      }}>
                        Product: {account.product ? account.product.productName : 'N/A'}
                      </div>
                      
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--muted-text)',
                        marginTop: '4px'
                      }}>
                        Balance: {account.availableBalance ? `$${parseFloat(account.availableBalance).toFixed(2)}` : '$0.00'}
                      </div>
                    </div>
                    
                    {selectedAccount?.id === account.id && (
                      <div style={{
                        color: 'var(--primary-500)',
                        fontSize: '20px'
                      }}>
                        <FiCheck />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedAccount}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: selectedAccount ? 'var(--primary-500)' : 'var(--gray-300)',
              color: 'white',
              cursor: selectedAccount ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Select Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountLookupModal;
