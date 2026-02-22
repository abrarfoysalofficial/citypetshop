# Phase 1 — Foundation (Auth + RBAC + Audit Log + Menu System)

**Date:** 2026-02-22  
**Status:** Complete

---

## 1. What Changed

### Schema
- **PermissionGroup** model: `id`, `name`, `slug`, `icon`, `sortOrder`, `isActive`
- **Permission** model: added `groupId`, `menuLabel`, `menuHref`, `menuSortOrder` for menu-driven UI

### RBAC & Auth
- Admin auth verified (requireAdminAuth, requireAdminAuthAndPermission)
- Role, Permission, UserRole, RolePermission already existed
- PermissionGroup added for grouping permissions into menu sections

### Menu System
- **GET /api/admin/menu** — returns sidebar menu based on user permissions
- Menu built from PermissionGroups + Permissions with `menuLabel`/`menuHref`
- AdminLayout fetches menu from API; falls back to static config if fetch fails
- Demo user gets full static menu (no DB roles)

### Audit Log
- Audit log API and UI already existed
- Audit logs API now uses `audit.view` permission
- `audit.view` permission added to seed with menu entry

---

## 2. DB Migrations + Seed

### Migration
```bash
npx prisma migrate deploy
```

Migration file: `prisma/migrations/20260222120000_add_permission_group_and_menu/migration.sql`

- Creates `permission_groups` table
- Adds `group_id`, `menu_label`, `menu_href`, `menu_sort_order` to `permissions`
- Foreign key: `permissions.group_id` → `permission_groups.id`

### Seed
```bash
npx prisma db seed
```

- Creates PermissionGroups: dashboard, order-management, product-management, content, customers, reports, settings
- Updates permissions with groupId, menuLabel, menuHref
- Adds `audit.view` permission

---

## 3. API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /api/admin/menu | requireAdminAuth | Sidebar menu from permissions |
| GET | /api/admin/audit-logs | audit.view | List audit logs (paginated) |

---

## 4. UI Routes

| Path | Purpose |
|------|---------|
| /admin | Dashboard (menu loads from API) |
| /admin/audit-logs | Audit log viewer |

---

## 5. Verification Checklist

### Manual
1. Run migration: `npx prisma migrate deploy`
2. Run seed: `npx prisma db seed`
3. Start app: `npm run dev`
4. Visit /admin/login, sign in
5. Sidebar should show menu items based on permissions (Dashboard, Orders, Products, etc.)
6. Visit /admin/audit-logs — should show audit entries (create/edit a product to generate logs)

### Commands
```bash
npx prisma migrate deploy
npx prisma db seed
npm run build
```

---

## 6. Rollback Plan

```bash
# Revert migration (if supported)
npx prisma migrate resolve --rolled-back 20260222120000_add_permission_group_and_menu

# Or manually:
# DROP CONSTRAINT permissions_group_id_fkey;
# ALTER TABLE permissions DROP COLUMN group_id, DROP COLUMN menu_label, DROP COLUMN menu_href, DROP COLUMN menu_sort_order;
# DROP TABLE permission_groups;
```

Revert code:
```bash
git checkout -- prisma/schema.prisma prisma/seed.ts
git checkout -- app/admin/AdminLayout.tsx app/api/admin/menu/ app/api/admin/audit-logs/route.ts
rm -rf app/api/admin/menu
```
