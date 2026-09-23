import { useEffect, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { usersApi } from '../api/adminService';
import type { AdminPermission } from '../models';

interface PermissionState {
  isMasterAdmin: boolean;
  permissions: AdminPermission[];
  loaded: boolean;
}

// The self-record's isMasterAdmin/permissions come from GET /admin/users
// (self is always included, since a real admin can always see themselves).
// If that call 403s (e.g. someone without MANAGE_ADMINS), we fall back to
// "no known permissions" rather than guessing — each protected screen still
// enforces its own access via the backend's real 403 response.
export function useAdminPermissions(): PermissionState {
  const { admin } = useAdminAuth();
  const [state, setState] = useState<PermissionState>({ isMasterAdmin: false, permissions: [], loaded: false });

  useEffect(() => {
    if (!admin) return;
    usersApi
      .list()
      .then((users) => {
        const self = users.find((u) => u.id === admin.id);
        setState({
          isMasterAdmin: self?.isMasterAdmin ?? false,
          permissions: self?.adminPermissions ?? [],
          loaded: true,
        });
      })
      .catch(() => setState({ isMasterAdmin: false, permissions: [], loaded: true }));
  }, [admin]);

  return state;
}