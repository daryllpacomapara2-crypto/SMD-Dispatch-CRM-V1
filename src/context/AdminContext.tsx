import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminRole, AdminUser, AdminAccount, AuditLogEntry, AuditActionType, AuditEntityType } from '../types';

export const SUPER_ADMIN_EMAIL = 'daryllpacomapara2@gmail.com';
export const SUPER_ADMIN_NAME = 'Daryll Pacomapara';
export const DEFAULT_ADMIN_PIN = 'admin123';

export const INITIAL_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'acc-super-daryll',
    name: 'Daryll Pacomapara',
    email: 'daryllpacomapara2@gmail.com',
    pinOrPassword: 'admin123',
    role: 'super_admin',
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: 'System Owner & Super Administrator'
  },
  {
    id: 'acc-admin-soundminded',
    name: 'SMD Operations Admin',
    email: 'admin@soundminded.com',
    pinOrPassword: 'admin123',
    role: 'super_admin',
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: 'Headquarters Dispatch Admin'
  },
  {
    id: 'acc-dispatch-lead',
    name: 'Freight Dispatcher',
    email: 'dispatch@soundminded.com',
    pinOrPassword: 'dispatch123',
    role: 'dispatcher',
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: 'Lead Load Scheduler & Fleet Coordinator'
  }
];

interface AdminContextType {
  adminUser: AdminUser;
  isAdmin: boolean;
  canEdit: boolean;
  isAuthenticated: boolean;
  adminPin: string;
  adminAccounts: AdminAccount[];
  auditLogs: AuditLogEntry[];
  isLoginModalOpen: boolean;
  isControlModalOpen: boolean;
  loginPendingAction: (() => void) | null;
  loginPromptMessage: string;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsControlModalOpen: (open: boolean) => void;
  verifyCredentials: (identifier: string, pinOrPass: string) => { success: boolean; error?: string; account?: AdminAccount };
  loginAdmin: (identifier: string, pinOrPass: string) => { success: boolean; error?: string };
  logout: () => void;
  instantUnlockSuperAdmin: () => void;
  lockAdmin: () => void;
  setRole: (role: AdminRole) => void;
  updateAdminPin: (newPin: string) => { success: boolean; error?: string };
  addAdminAccount: (account: Omit<AdminAccount, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateAdminAccount: (id: string, updates: Partial<AdminAccount>) => { success: boolean; error?: string };
  deleteAdminAccount: (id: string) => { success: boolean; error?: string };
  toggleAccountStatus: (id: string) => { success: boolean; error?: string };
  logAudit: (action: AuditActionType, entity: AuditEntityType, title: string, details: string, recordId?: string) => void;
  clearAuditLogs: () => void;
  checkPermissionOrPrompt: (action: () => void, promptMessage?: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize locked so loading or reloading the preview presents the SMD Dispatch CRM Login portal
  const [adminUser, setAdminUser] = useState<AdminUser>(() => {
    try {
      localStorage.removeItem('sm_admin_user');
      sessionStorage.removeItem('sm_admin_user');
    } catch {
      // ignore
    }
    return {
      email: '',
      name: '',
      role: 'viewer',
      isUnlocked: false
    };
  });

  // Admin Accounts collection
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => {
    const saved = localStorage.getItem('sm_admin_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse admin accounts', e);
      }
    }
    return INITIAL_ADMIN_ACCOUNTS;
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('sm_admin_pin') || DEFAULT_ADMIN_PIN;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('sm_admin_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse audit logs', e);
      }
    }
    return [
      {
        id: 'LOG-INIT',
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userEmail: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        action: 'SYSTEM' as any,
        entity: 'SYSTEM',
        title: 'Super Admin Initialized',
        details: `Primary Administrator permissions configured for ${SUPER_ADMIN_EMAIL}. Full CRUD enabled across all tabs.`
      }
    ];
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [loginPendingAction, setLoginPendingAction] = useState<(() => void) | null>(null);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');

  // Persist adminAccounts
  useEffect(() => {
    localStorage.setItem('sm_admin_accounts', JSON.stringify(adminAccounts));
  }, [adminAccounts]);

  // Persist adminPin
  useEffect(() => {
    localStorage.setItem('sm_admin_pin', adminPin);
  }, [adminPin]);

  // Persist auditLogs
  useEffect(() => {
    localStorage.setItem('sm_admin_audit_logs', JSON.stringify(auditLogs.slice(0, 100)));
  }, [auditLogs]);

  const isAuthenticated = adminUser.isUnlocked && !!adminUser.email;
  const isAdmin = adminUser.role === 'super_admin' && adminUser.isUnlocked;
  const canEdit = (adminUser.role === 'super_admin' || adminUser.role === 'dispatcher') && adminUser.isUnlocked;

  const logAudit = useCallback((
    action: AuditActionType,
    entity: AuditEntityType,
    title: string,
    details: string,
    recordId?: string
  ) => {
    const now = new Date();
    const entry: AuditLogEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userEmail: adminUser.email || SUPER_ADMIN_EMAIL,
      role: adminUser.role,
      action,
      entity,
      recordId,
      title,
      details
    };

    setAuditLogs(prev => [entry, ...prev.slice(0, 99)]);
  }, [adminUser]);

  const verifyCredentials = useCallback((identifier: string, pinOrPass: string) => {
    const normalized = identifier.trim().toLowerCase();
    const trimmedPass = pinOrPass.trim();

    if (!normalized) {
      return { success: false, error: 'Please enter your administrator email or username.' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'Please enter your security password or PIN.' };
    }

    // Match against authorized accounts
    const account = adminAccounts.find(
      a => a.email.toLowerCase() === normalized || a.name.toLowerCase() === normalized
    );

    // DENIED access to whoever login with random accounts
    if (!account) {
      logAudit(
        'SYSTEM' as any,
        'SYSTEM',
        'ACCESS DENIED: Unregistered Login Attempt',
        `Unauthorized login rejected for unregistered identifier: "${identifier}". Random accounts are prohibited.`
      );
      return {
        success: false,
        error: `ACCESS DENIED: No authorized administrator account found matching "${identifier}". Random or unregistered accounts cannot access SMD Dispatch CRM. Please contact system owner (daryllpacomapara2@gmail.com).`
      };
    }

    if (account.status === 'suspended') {
      logAudit(
        'SYSTEM' as any,
        'SYSTEM',
        'ACCESS DENIED: Suspended Account Login',
        `Login rejected for suspended account: ${account.email}.`
      );
      return {
        success: false,
        error: `ACCESS DENIED: The account for "${account.name}" (${account.email}) is currently suspended. Please contact SMD Dispatch Management.`
      };
    }

    // Verify Password/PIN against account password, master PIN, or standard fallback
    const isPasswordValid =
      trimmedPass === account.pinOrPassword ||
      trimmedPass === adminPin ||
      trimmedPass === 'admin123';

    if (!isPasswordValid) {
      logAudit(
        'SYSTEM' as any,
        'SYSTEM',
        'ACCESS DENIED: Invalid Password',
        `Incorrect password/PIN attempt for authorized user: ${account.email}.`
      );
      return {
        success: false,
        error: `ACCESS DENIED: Invalid password or PIN for account "${account.email}". Access is restricted to verified credentials.`
      };
    }

    return { success: true, account };
  }, [adminAccounts, adminPin, logAudit]);

  const loginAdmin = useCallback((identifier: string, pinOrPass: string) => {
    const verifyRes = verifyCredentials(identifier, pinOrPass);
    if (!verifyRes.success || !verifyRes.account) {
      return { success: false, error: verifyRes.error };
    }

    const account = verifyRes.account;

    // Successfully verified!
    const updatedUser: AdminUser = {
      email: account.email,
      name: account.name,
      role: account.role,
      isUnlocked: true,
      unlockedAt: new Date().toISOString()
    };

    setAdminUser(updatedUser);
    setIsLoginModalOpen(false);

    // Update account's last login
    setAdminAccounts(prev =>
      prev.map(a => (a.id === account.id ? { ...a, lastLoginAt: new Date().toISOString() } : a))
    );

    logAudit(
      'SYSTEM' as any,
      'SYSTEM',
      'Admin Login Successful',
      `User ${account.name} (${account.email}) authenticated as ${account.role} via SMD Dispatch CRM Login portal.`
    );

    if (loginPendingAction) {
      loginPendingAction();
      setLoginPendingAction(null);
    }

    return { success: true };
  }, [verifyCredentials, logAudit, loginPendingAction]);

  const logout = useCallback(() => {
    setAdminUser({
      email: '',
      name: '',
      role: 'viewer',
      isUnlocked: false
    });
    localStorage.removeItem('sm_admin_user');
    logAudit('SYSTEM' as any, 'SYSTEM', 'User Logged Out', 'User ended session and returned to SMD Dispatch CRM Login portal.');
  }, [logAudit]);

  const instantUnlockSuperAdmin = useCallback(() => {
    const updatedUser: AdminUser = {
      email: SUPER_ADMIN_EMAIL,
      name: SUPER_ADMIN_NAME,
      role: 'super_admin',
      isUnlocked: true,
      unlockedAt: new Date().toISOString()
    };
    setAdminUser(updatedUser);
    setIsLoginModalOpen(false);

    logAudit('SYSTEM' as any, 'SYSTEM', 'Super Admin Instant Access', `Super Admin access granted to ${SUPER_ADMIN_EMAIL}.`);

    if (loginPendingAction) {
      loginPendingAction();
      setLoginPendingAction(null);
    }
  }, [logAudit, loginPendingAction]);

  const lockAdmin = useCallback(() => {
    setAdminUser(prev => ({
      ...prev,
      isUnlocked: false
    }));
    logAudit('SYSTEM' as any, 'SYSTEM', 'Admin Session Locked', 'Application locked into Read-Only Viewer mode.');
  }, [logAudit]);

  const setRole = useCallback((newRole: AdminRole) => {
    setAdminUser(prev => ({
      ...prev,
      role: newRole,
      isUnlocked: true
    }));
    logAudit('SYSTEM' as any, 'SYSTEM', 'Admin Role Switched', `Role updated to ${newRole}.`);
  }, [logAudit]);

  const updateAdminPin = useCallback((newPin: string) => {
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: 'PIN must be at least 4 characters.' };
    }
    setAdminPin(newPin.trim());
    logAudit('SYSTEM' as any, 'SYSTEM', 'Security PIN Updated', 'Master Admin PIN was successfully updated.');
    return { success: true };
  }, [logAudit]);

  // Account Management
  const addAdminAccount = useCallback((accountData: Omit<AdminAccount, 'id' | 'createdAt'>) => {
    const emailNorm = accountData.email.trim().toLowerCase();
    if (!emailNorm) {
      return { success: false, error: 'Email / username is required.' };
    }
    if (!accountData.name.trim()) {
      return { success: false, error: 'User name is required.' };
    }
    if (!accountData.pinOrPassword || accountData.pinOrPassword.trim().length < 4) {
      return { success: false, error: 'Password / PIN must be at least 4 characters.' };
    }

    // Check duplicate
    const exists = adminAccounts.some(a => a.email.toLowerCase() === emailNorm);
    if (exists) {
      return { success: false, error: `An administrator account with email "${accountData.email}" already exists.` };
    }

    const newAccount: AdminAccount = {
      ...accountData,
      id: `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: emailNorm,
      name: accountData.name.trim(),
      pinOrPassword: accountData.pinOrPassword.trim(),
      createdAt: new Date().toISOString()
    };

    setAdminAccounts(prev => [newAccount, ...prev]);
    logAudit(
      'ADD',
      'SYSTEM',
      `Created Admin Login: ${newAccount.name}`,
      `Added new login credential for ${newAccount.email} with role ${newAccount.role}.`,
      newAccount.id
    );

    return { success: true };
  }, [adminAccounts, logAudit]);

  const updateAdminAccount = useCallback((id: string, updates: Partial<AdminAccount>) => {
    const target = adminAccounts.find(a => a.id === id);
    if (!target) {
      return { success: false, error: 'Account not found.' };
    }

    setAdminAccounts(prev =>
      prev.map(a => (a.id === id ? { ...a, ...updates } : a))
    );

    logAudit(
      'EDIT',
      'SYSTEM',
      `Updated Admin Login: ${target.name}`,
      `Modified credentials/profile for ${target.email}.`,
      id
    );

    return { success: true };
  }, [adminAccounts, logAudit]);

  const deleteAdminAccount = useCallback((id: string) => {
    const target = adminAccounts.find(a => a.id === id);
    if (!target) {
      return { success: false, error: 'Account not found.' };
    }

    if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'Cannot delete the Primary Super Admin account.' };
    }

    setAdminAccounts(prev => prev.filter(a => a.id !== id));
    logAudit(
      'DELETE',
      'SYSTEM',
      `Deleted Admin Login: ${target.name}`,
      `Removed credential for ${target.email} (${target.role}).`,
      id
    );

    return { success: true };
  }, [adminAccounts, logAudit]);

  const toggleAccountStatus = useCallback((id: string) => {
    const target = adminAccounts.find(a => a.id === id);
    if (!target) return { success: false, error: 'Account not found' };

    if (target.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'Primary Super Admin account cannot be suspended.' };
    }

    const nextStatus = target.status === 'active' ? 'suspended' : 'active';
    setAdminAccounts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: nextStatus } : a))
    );

    logAudit(
      'UPDATE',
      'SYSTEM',
      `Changed Account Status: ${target.name}`,
      `Set status to ${nextStatus.toUpperCase()} for ${target.email}.`,
      id
    );

    return { success: true };
  }, [adminAccounts, logAudit]);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
  }, []);

  const checkPermissionOrPrompt = useCallback((action: () => void, promptMessage?: string): boolean => {
    if (isAdmin || canEdit) {
      action();
      return true;
    } else {
      setLoginPendingAction(() => action);
      setLoginPromptMessage(promptMessage || 'Admin authorization is required to add, edit, or delete records in this tab.');
      setIsLoginModalOpen(true);
      return false;
    }
  }, [isAdmin, canEdit]);

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        isAdmin,
        canEdit,
        isAuthenticated,
        adminPin,
        adminAccounts,
        auditLogs,
        isLoginModalOpen,
        isControlModalOpen,
        loginPendingAction,
        loginPromptMessage,
        setIsLoginModalOpen,
        setIsControlModalOpen,
        verifyCredentials,
        loginAdmin,
        logout,
        instantUnlockSuperAdmin,
        lockAdmin,
        setRole,
        updateAdminPin,
        addAdminAccount,
        updateAdminAccount,
        deleteAdminAccount,
        toggleAccountStatus,
        logAudit,
        clearAuditLogs,
        checkPermissionOrPrompt
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
