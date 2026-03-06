/**
 * Tenant context for multi-tenant SaaS.
 * Default tenant ID for single-tenant / migration compatibility.
 */

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Returns the default tenant ID (single-tenant deployment).
 * Phase 3+: Resolve from request (subdomain, header, or JWT).
 */
export function getDefaultTenantId(): string {
  return DEFAULT_TENANT_ID;
}

/**
 * Resolves tenant ID for the current request context.
 * For single-tenant: always returns default.
 * For multi-tenant: override from request headers, subdomain, etc.
 */
export function resolveTenantId(): string {
  return getDefaultTenantId();
}

export { DEFAULT_TENANT_ID };
