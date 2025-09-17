const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Sample roles data
const sampleRoles = [
  {
    roleId: 'ADMIN001',
    roleName: 'System Administrator',
    description: 'Full system access with all permissions',
    status: 'Active',
    permissions: {
      member_maintenance: { canAdd: true, canView: true, canEdit: true, canDelete: true },
      user_maintenance: { canAdd: true, canView: true, canEdit: true, canDelete: true },
      role_maintenance: { canAdd: true, canView: true, canEdit: true, canDelete: true },
      loan_calculator: { canAdd: true, canView: true, canEdit: true, canDelete: true },
      product_maintenance: { canAdd: true, canView: true, canEdit: true, canDelete: true },
      sacco_maintenance: { canAdd: true, canView: true, canEdit: true, canDelete: true },
      branch_maintenance: { canAdd: true, canView: true, canEdit: true, canDelete: true },
      accounts_management: { canAdd: true, canView: true, canEdit: true, canDelete: true }
    }
  },
  {
    roleId: 'USER002',
    roleName: 'Regular User',
    description: 'Standard user with limited permissions',
    status: 'Active',
    permissions: {
      member_maintenance: { canAdd: false, canView: true, canEdit: false, canDelete: false },
      user_maintenance: { canAdd: false, canView: false, canEdit: false, canDelete: false },
      role_maintenance: { canAdd: false, canView: false, canEdit: false, canDelete: false },
      loan_calculator: { canAdd: false, canView: true, canEdit: false, canDelete: false },
      product_maintenance: { canAdd: false, canView: true, canEdit: false, canDelete: false },
      sacco_maintenance: { canAdd: false, canView: false, canEdit: false, canDelete: false },
      branch_maintenance: { canAdd: false, canView: false, canEdit: false, canDelete: false },
      accounts_management: { canAdd: false, canView: true, canEdit: false, canDelete: false }
    }
  },
  {
    roleId: 'MANAGER003',
    roleName: 'Department Manager',
    description: 'Manager role with department-level permissions',
    status: 'Active',
    permissions: {
      member_maintenance: { canAdd: true, canView: true, canEdit: true, canDelete: false },
      user_maintenance: { canAdd: false, canView: true, canEdit: false, canDelete: false },
      role_maintenance: { canAdd: false, canView: true, canEdit: false, canDelete: false },
      loan_calculator: { canAdd: true, canView: true, canEdit: true, canDelete: false },
      product_maintenance: { canAdd: true, canView: true, canEdit: true, canDelete: false },
      sacco_maintenance: { canAdd: false, canView: true, canEdit: false, canDelete: false },
      branch_maintenance: { canAdd: false, canView: true, canEdit: false, canDelete: false },
      accounts_management: { canAdd: true, canView: true, canEdit: true, canDelete: false }
    }
  }
];

async function createSampleRoles() {
  console.log('🚀 Creating sample roles...\n');
  
  try {
    for (const role of sampleRoles) {
      console.log(`Creating role: ${role.roleName}...`);
      const response = await axios.post(`${BASE_URL}/roles`, role);
      console.log(`✅ Created: ${response.data.entity.roleName} (ID: ${response.data.entity.id})`);
    }
    
    console.log('\n🎉 All sample roles created successfully!');
    
    // Test fetching all roles
    console.log('\n📋 Fetching all roles...');
    const getResponse = await axios.get(`${BASE_URL}/roles`);
    console.log(`Found ${getResponse.data.entity.length} roles in database`);
    
  } catch (error) {
    console.error('❌ Error creating sample roles:', error.response?.data || error.message);
  }
}

// Wait a bit for server to start, then create sample data
setTimeout(() => {
  createSampleRoles();
}, 3000);
