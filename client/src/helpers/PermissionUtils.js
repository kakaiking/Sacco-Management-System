// Permission utility functions for RBAC
export const PERMISSIONS = {
  // Module permissions
  MEMBER_MAINTENANCE: 'member_maintenance',
  USER_MAINTENANCE: 'user_maintenance', 
  ROLE_MAINTENANCE: 'role_maintenance',
  PRODUCT_MAINTENANCE: 'product_maintenance',
  CURRENCY_MAINTENANCE: 'currency_maintenance',
  SACCO_MAINTENANCE: 'sacco_maintenance',
  BRANCH_MAINTENANCE: 'branch_maintenance',
  CHARGES_MANAGEMENT: 'charges_management',
  ACCOUNTS_MANAGEMENT: 'accounts_management',
  TRANSACTION_MAINTENANCE: 'transaction_maintenance',
  LOAN_CALCULATOR: 'loan_calculator',
  LOGS_MAINTENANCE: 'logs_maintenance',
  
  // Action permissions
  VIEW: 'view',
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve', // For status changes/approvals
};

// Default permissions structure for roles
export const DEFAULT_PERMISSIONS = {
  [PERMISSIONS.MEMBER_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.USER_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.ROLE_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.PRODUCT_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.CURRENCY_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.SACCO_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.BRANCH_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.CHARGES_MANAGEMENT]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.ACCOUNTS_MANAGEMENT]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.TRANSACTION_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.LOAN_CALCULATOR]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
  [PERMISSIONS.LOGS_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: false,
    [PERMISSIONS.ADD]: false,
    [PERMISSIONS.EDIT]: false,
    [PERMISSIONS.DELETE]: false,
    [PERMISSIONS.APPROVE]: false,
  },
};

// Admin permissions (full access)
export const ADMIN_PERMISSIONS = {
  [PERMISSIONS.MEMBER_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.USER_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.ROLE_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.PRODUCT_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.CURRENCY_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.SACCO_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.BRANCH_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.CHARGES_MANAGEMENT]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.ACCOUNTS_MANAGEMENT]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.TRANSACTION_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.LOAN_CALCULATOR]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: true,
    [PERMISSIONS.EDIT]: true,
    [PERMISSIONS.DELETE]: true,
    [PERMISSIONS.APPROVE]: true,
  },
  [PERMISSIONS.LOGS_MAINTENANCE]: {
    [PERMISSIONS.VIEW]: true,
    [PERMISSIONS.ADD]: false, // Logs are read-only
    [PERMISSIONS.EDIT]: false, // Logs are read-only
    [PERMISSIONS.DELETE]: false, // Logs are read-only
    [PERMISSIONS.APPROVE]: false, // Logs are read-only
  },
};

/**
 * Get user permissions based on their role
 * @param {string} role - User's role
 * @param {object} rolePermissions - Permissions from role object
 * @returns {object} User permissions
 */
export const getUserPermissions = (role, rolePermissions = {}) => {
  // If user is admin or super user, give full permissions
  if (role === 'Admin' || role === 'admin' || role === 'Super User' || role === 'super user') {
    return ADMIN_PERMISSIONS;
  }
  
  // Merge role permissions with defaults
  const permissions = { ...DEFAULT_PERMISSIONS };
  
  // Apply role-specific permissions
  Object.keys(rolePermissions).forEach(module => {
    if (permissions[module]) {
      Object.keys(rolePermissions[module]).forEach(action => {
        // Handle both formats: "add" and "canAdd"
        let normalizedAction = action;
        if (action.startsWith('can')) {
          normalizedAction = action.substring(3).toLowerCase();
        }
        
        if (permissions[module][normalizedAction] !== undefined) {
          permissions[module][normalizedAction] = rolePermissions[module][action];
        }
      });
    }
  });
  
  return permissions;
};

/**
 * Check if user has permission for a specific module and action
 * @param {object} userPermissions - User's permissions object
 * @param {string} module - Module name
 * @param {string} action - Action name
 * @returns {boolean} Whether user has permission
 */
export const hasPermission = (userPermissions, module, action) => {
  if (!userPermissions || !module || !action) {
    return false;
  }
  
  return userPermissions[module] && userPermissions[module][action] === true;
};

/**
 * Check if user can view a module
 * @param {object} userPermissions - User's permissions object
 * @param {string} module - Module name
 * @returns {boolean} Whether user can view the module
 */
export const canView = (userPermissions, module) => {
  return hasPermission(userPermissions, module, PERMISSIONS.VIEW);
};

/**
 * Check if user can add to a module
 * @param {object} userPermissions - User's permissions object
 * @param {string} module - Module name
 * @returns {boolean} Whether user can add to the module
 */
export const canAdd = (userPermissions, module) => {
  return hasPermission(userPermissions, module, PERMISSIONS.ADD);
};

/**
 * Check if user can edit in a module
 * @param {object} userPermissions - User's permissions object
 * @param {string} module - Module name
 * @returns {boolean} Whether user can edit in the module
 */
export const canEdit = (userPermissions, module) => {
  return hasPermission(userPermissions, module, PERMISSIONS.EDIT);
};

/**
 * Check if user can delete in a module
 * @param {object} userPermissions - User's permissions object
 * @param {string} module - Module name
 * @returns {boolean} Whether user can delete in the module
 */
export const canDelete = (userPermissions, module) => {
  return hasPermission(userPermissions, module, PERMISSIONS.DELETE);
};

/**
 * Check if user can approve/change status in a module
 * @param {object} userPermissions - User's permissions object
 * @param {string} module - Module name
 * @returns {boolean} Whether user can approve in the module
 */
export const canApprove = (userPermissions, module) => {
  return hasPermission(userPermissions, module, PERMISSIONS.APPROVE);
};

/**
 * Get modules that user can view
 * @param {object} userPermissions - User's permissions object
 * @returns {array} Array of module names user can view
 */
export const getViewableModules = (userPermissions) => {
  if (!userPermissions) return [];
  
  return Object.keys(userPermissions).filter(module => 
    canView(userPermissions, module)
  );
};
