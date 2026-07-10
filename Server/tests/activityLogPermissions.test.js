import test from 'node:test';
import assert from 'node:assert/strict';
import { canManageActivityLogs } from '../utils/accessControl.js';
import { PERMISSIONS } from '../constants/permissions.js';

test('allows super admin to manage activity logs settings', () => {
  const requester = {
    role: { name: 'Super Admin', Permissions: [] },
  };

  assert.equal(canManageActivityLogs(requester), true);
});

test('allows users with audit_logs.manage permission', () => {
  const requester = {
    role: {
      name: 'Admin',
      Permissions: [{ name: PERMISSIONS.AUDIT_LOGS_MANAGE }],
    },
  };

  assert.equal(canManageActivityLogs(requester), true);
});

test('denies users without audit_logs.manage permission', () => {
  const requester = {
    role: {
      name: 'Admin',
      Permissions: [{ name: PERMISSIONS.AUDIT_LOGS_VIEW }],
    },
  };

  assert.equal(canManageActivityLogs(requester), false);
});
