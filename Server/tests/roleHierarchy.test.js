import test from 'node:test';
import assert from 'node:assert/strict';
import { canAssignRole } from '../utils/roleHierarchy.js';

test('allows assigning a lower-ranked role', () => {
  assert.equal(canAssignRole('Admin', 'User'), true);
});

test('blocks assigning the same role level', () => {
  assert.equal(canAssignRole('Admin', 'Admin'), false);
});

test('blocks assigning a higher-ranked role', () => {
  assert.equal(canAssignRole('Admin', 'Super Admin'), false);
});

test('allows super admin to assign lower or same-ranked roles', () => {
  assert.equal(canAssignRole('Super Admin', 'Admin'), true);
  assert.equal(canAssignRole('Super Admin', 'User'), true);
  assert.equal(canAssignRole('Super Admin', 'Super Admin'), true);
});
