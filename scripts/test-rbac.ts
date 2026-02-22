/**
 * Test script for RBAC system
 */
import { hasPermission, getUserPermissions } from "../lib/rbac";

async function testRBAC() {
  console.log("Testing RBAC system...");

  // Test with a known user ID (assuming the admin user exists)
  const testUserId = "test-user-id";

  try {
    const permissions = await getUserPermissions(testUserId);
    console.log("User permissions:", permissions);

    const hasAdminView = await hasPermission(testUserId, "admin.view");
    console.log("Has admin.view permission:", hasAdminView);

  } catch (error) {
    console.error("RBAC test error:", error);
  }
}

testRBAC();