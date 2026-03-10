/**
 * BaseTenantService - All tenant-scoped queries MUST include tenantId filter.
 * Do NOT allow unscoped queries.
 */
import { resolveTenantId } from "@/lib/tenant";

export abstract class BaseTenantService {
  protected getTenantId(): string {
    return resolveTenantId();
  }

  /**
   * Ensures tenantId is always in where clause.
   * Use for all findMany, findFirst, findUnique on tenant-scoped models.
   */
  protected scope<T extends Record<string, unknown>>(where: T): T & { tenantId: string } {
    return {
      ...where,
      tenantId: this.getTenantId(),
    };
  }
}
