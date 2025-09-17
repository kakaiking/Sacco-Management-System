const axios = require('axios');

// Test script to verify the financial system is working
async function testFinancialSystem() {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('Testing Financial System Setup...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    try {
      const response = await axios.get(`${baseURL}/accounts/test`);
      console.log('✅ Server is running and database connection is working');
      console.log('   Response:', response.data.message);
    } catch (error) {
      console.log('❌ Server connection failed:', error.message);
      return;
    }

    // Test 2: Check Chart of Accounts
    console.log('\n2. Testing Chart of Accounts...');
    try {
      const response = await axios.get(`${baseURL}/chart-of-accounts`);
      console.log('✅ Chart of Accounts endpoint is working');
      console.log(`   Found ${response.data.entity.length} accounts in Chart of Accounts`);
      
      // Show some sample accounts
      const sampleAccounts = response.data.entity.slice(0, 5);
      console.log('   Sample accounts:');
      sampleAccounts.forEach(account => {
        console.log(`     - ${account.accountCode}: ${account.accountName} (${account.accountType})`);
      });
    } catch (error) {
      console.log('❌ Chart of Accounts test failed:', error.message);
    }

    // Test 3: Check if we have the required accounts for transactions
    console.log('\n3. Testing required accounts for transactions...');
    try {
      const response = await axios.get(`${baseURL}/chart-of-accounts`);
      const accounts = response.data.entity;
      
      const cashAtBank = accounts.find(acc => acc.accountCode === '1001');
      const feeIncome = accounts.find(acc => acc.accountCode === '4001');
      const interestIncome = accounts.find(acc => acc.accountCode === '4002');
      const interestExpense = accounts.find(acc => acc.accountCode === '5001');
      
      if (cashAtBank) console.log('✅ Cash at Bank account found');
      else console.log('❌ Cash at Bank account missing');
      
      if (feeIncome) console.log('✅ Fee Income account found');
      else console.log('❌ Fee Income account missing');
      
      if (interestIncome) console.log('✅ Interest Income account found');
      else console.log('❌ Interest Income account missing');
      
      if (interestExpense) console.log('✅ Interest Expense account found');
      else console.log('❌ Interest Expense account missing');
      
    } catch (error) {
      console.log('❌ Required accounts test failed:', error.message);
    }

    // Test 4: Check Members endpoint
    console.log('\n4. Testing Members endpoint...');
    try {
      const response = await axios.get(`${baseURL}/members`);
      console.log('✅ Members endpoint is working');
      console.log(`   Found ${response.data.entity.length} members`);
    } catch (error) {
      console.log('❌ Members endpoint test failed:', error.message);
    }

    // Test 5: Check Products endpoint
    console.log('\n5. Testing Products endpoint...');
    try {
      const response = await axios.get(`${baseURL}/products`);
      console.log('✅ Products endpoint is working');
      console.log(`   Found ${response.data.entity.length} products`);
    } catch (error) {
      console.log('❌ Products endpoint test failed:', error.message);
    }

    // Test 6: Check Accounts endpoint
    console.log('\n6. Testing Accounts endpoint...');
    try {
      const response = await axios.get(`${baseURL}/accounts`);
      console.log('✅ Accounts endpoint is working');
      console.log(`   Found ${response.data.entity.length} member accounts`);
    } catch (error) {
      console.log('❌ Accounts endpoint test failed:', error.message);
    }

    console.log('\n🎉 Financial System Setup Test Complete!');
    console.log('\nNext Steps:');
    console.log('1. Open your browser and go to http://localhost:3000');
    console.log('2. Login to the system');
    console.log('3. Navigate to "Financial Operations" in the sidebar');
    console.log('4. Test the Transaction Management, Member Statement, and General Ledger features');
    console.log('\nNote: You may need to create some test data (members, products, accounts) to fully test the system.');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testFinancialSystem();
