# SACCO Financial System Implementation Guide

This document provides comprehensive instructions for setting up and using the newly implemented financial system for your SACCO management system.

## Overview

The financial system includes:
- **Chart of Accounts**: Complete double-entry accounting structure
- **General Ledger**: Centralized transaction recording with double-entry rules
- **Transaction Management**: Deposit, withdrawal, and loan disbursement processing
- **Interest Calculation**: Automated interest calculation and processing
- **Member Statements**: Account statement generation and printing
- **General Ledger Reports**: Trial balance and account-level reporting

## Backend Setup

### 1. Install Dependencies

Navigate to the server directory and install the new dependencies:

```bash
cd server
npm install node-cron@^3.0.3 uuid@^9.0.1
```

### 2. Run Database Migrations

Execute the new migrations to create the financial tables:

```bash
npx sequelize-cli db:migrate
```

This will create the following tables:
- `ChartOfAccounts` - Chart of accounts structure
- `GLTransactions` - General ledger transactions
- `InterestSchedule` - Interest calculation records

### 3. Seed Chart of Accounts

Run the seed script to populate the initial chart of accounts:

```bash
node scripts/seedChartOfAccounts.js
```

This creates the standard SACCO chart of accounts including:
- Assets (Cash at Bank, Member Loans, etc.)
- Liabilities (Member Savings, Member Shares, etc.)
- Equity (Share Capital, Retained Earnings, etc.)
- Income (Fee Income, Interest Income, etc.)
- Expenses (Interest Expense, Administrative Expenses, etc.)

### 4. Start the Server

```bash
npm run dev
```

The scheduler service will automatically start and run:
- Daily interest calculation at 2:00 AM
- Monthly interest processing at 1st of each month at 3:00 AM

## Frontend Setup

### 1. Install Dependencies

Navigate to the client directory and install required dependencies:

```bash
cd client
npm install @material-ui/pickers react-to-print
```

### 2. Start the Frontend

```bash
npm start
```

## API Endpoints

### Chart of Accounts
- `GET /chart-of-accounts` - List all accounts
- `POST /chart-of-accounts` - Create new account
- `PUT /chart-of-accounts/:id` - Update account
- `DELETE /chart-of-accounts/:id` - Delete account

### Transactions
- `POST /transactions/deposit` - Process deposit
- `POST /transactions/withdrawal` - Process withdrawal
- `POST /transactions/disburse-loan` - Process loan disbursement
- `GET /transactions/statement/:accountId` - Get account statement
- `GET /transactions/general-ledger` - Get general ledger data

## Usage Guide

### 1. Setting Up Products for Auto-Account Creation

When creating products, set the `appliedOnMemberOnboarding` field to `true` for products that should automatically create accounts when a member is registered.

### 2. Processing Transactions

#### Deposits
1. Navigate to Financial Operations > Transaction Management
2. Select the Deposit tab
3. Choose member and savings account
4. Enter amount and description
5. Click "Process Deposit"

#### Withdrawals
1. Navigate to Financial Operations > Transaction Management
2. Select the Withdrawal tab
3. Choose member and savings account
4. Enter amount and description
5. Click "Process Withdrawal"

#### Loan Disbursements
1. Navigate to Financial Operations > Transaction Management
2. Select the Loan Disbursement tab
3. Choose member and loan account
4. Enter loan amount and optional charges
5. Click "Process Loan Disbursement"

### 3. Generating Member Statements

1. Navigate to Financial Operations > Member Statement
2. Select member and account
3. Choose date range
4. Click "Generate Statement"
5. Use Print or Download PDF buttons

### 4. Viewing General Ledger

1. Navigate to Financial Operations > General Ledger
2. Choose view mode (Account View or Trial Balance)
3. Select account (for Account View)
4. Choose date range
5. Click "Generate Ledger"

## Financial Logic

### Double-Entry Accounting

All transactions follow double-entry accounting principles:

**Deposits:**
- Debit: Cash at Bank
- Credit: Member Savings Account

**Withdrawals:**
- Debit: Member Savings Account
- Credit: Cash at Bank

**Loan Disbursements:**
- Debit: Member Loan Account
- Credit: Cash at Bank
- (Optional) Debit: Cash at Bank, Credit: Fee Income

### Interest Calculation

The system automatically calculates interest based on:
- Product interest rates
- Interest frequency (Monthly, Quarterly, Annually)
- Interest calculation rule (Simple, Compound)
- Account balances

**Savings Interest:**
- Debit: Interest Expense on Deposits
- Credit: Member Savings Account

**Loan Interest:**
- Debit: Member Loan Account
- Credit: Interest Income on Loans

## Database Schema

### Chart of Accounts
```sql
- id (Primary Key)
- accountId (Unique identifier)
- accountName
- accountCode (Unique)
- accountType (Asset, Liability, Equity, Income, Expense)
- parentAccountId (For hierarchical structure)
- isActive
- description
```

### GL Transactions
```sql
- id (Primary Key)
- transactionId (Unique)
- accountId (Foreign Key to ChartOfAccounts)
- debitAmount
- creditAmount
- description
- referenceId
- referenceType
- transactionDate
- valueDate
```

### Interest Schedule
```sql
- id (Primary Key)
- accountId (Foreign Key to Accounts)
- memberId (Foreign Key to Members)
- productId (Foreign Key to Products)
- interestRate
- principalAmount
- interestAmount
- calculationDate
- valueDate
- interestType
- frequency
- isProcessed
```

## Security Considerations

1. All financial endpoints require authentication
2. Double-entry validation prevents unbalanced transactions
3. Database transactions ensure atomicity
4. Audit trail maintained through createdBy and timestamps

## Troubleshooting

### Common Issues

1. **"Cash at Bank account not found"**
   - Ensure the chart of accounts has been seeded
   - Check that account with code '1001' exists

2. **"Member savings account not found in chart of accounts"**
   - Verify that member accounts are created in chart of accounts during member registration
   - Check the member creation logic

3. **Interest calculation not running**
   - Check server logs for scheduler errors
   - Verify node-cron is installed
   - Ensure products have interest rates configured

### Manual Operations

You can manually trigger interest calculations:

```javascript
// In server console or create an endpoint
const InterestCalculationService = require('./services/interestCalculationService');
const result = await InterestCalculationService.calculateInterestForAllAccounts();
console.log(result);
```

## Monitoring

Monitor the following:
1. Daily interest calculation logs
2. Monthly interest processing results
3. GL transaction volumes
4. Account balance accuracy
5. Scheduler service status

## Backup Recommendations

1. Regular database backups before interest processing
2. Chart of accounts backup after any structural changes
3. GL transaction logs for audit purposes

## Support

For technical support or questions about the financial system implementation, refer to the code comments and this documentation. The system is designed to be robust and follows standard accounting principles.
