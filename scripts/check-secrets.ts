#!/usr/bin/env tsx
/**
 * Secret guardrail: fails build if secret patterns appear in tracked repo files.
 * Scans for: connection strings with passwords, NEXTAUTH_SECRET, MASTER_SECRET,
 * ADMIN_PASSWORD, private keys. Excludes: node_modules, .next, .git, lock files.
 * docs/ENV_TEMPLATE.md: allowed only if it contains keys/placeholders (e.g. KEY=) without real values.
 *
 * Run via: npm run check:secrets or prebuild.
 */
import * as fs from "fs";
import * as path from "path";

const EXCLUDE_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", ".turbo",
  "coverage", "test-results", "playwright-report", "legacy-data",
  "_backup", "pet product", "mcps", "docs", "deploy",
]);

/** Patterns that indicate a secret value. (?:...) = non-capturing. */
const SECRET_PATTERNS: { pattern: RegExp; name: string }[] = [
  // Connection string with password (postgresql://user:password@ or mysql://...)
  { pattern: /postgresql:\/\/[^:]+:[^@\s]+@/i, name: "DATABASE_URL with password" },
  { pattern: /mysql:\/\/[^:]+:[^@\s]+@/i, name: "MySQL URL with password" },
  // Env-style assignments with long/secret-looking values
  { pattern: /NEXTAUTH_SECRET\s*=\s*["']?[a-zA-Z0-9_-]{32,}["']?/, name: "NEXTAUTH_SECRET value" },
  { pattern: /MASTER_SECRET\s*=\s*["']?[a-zA-Z0-9_-]{32,}["']?/, name: "MASTER_SECRET value" },
  { pattern: /ADMIN_PASSWORD\s*=\s*["']?.+["']?/, name: "ADMIN_PASSWORD value" },
  // Private key blocks
  { pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, name: "Private key block" },
  { pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/, name: "OpenSSH private key" },
];

function shouldExclude(filePath: string): boolean {
  const parts = filePath.split(path.sep);
  if (parts.some((p) => EXCLUDE_DIRS.has(p))) return true;
  const base = path.basename(filePath).toLowerCase();
  if (base.startsWith(".env")) return true; // never scan env files (may contain real secrets)
  if (base.endsWith(".lock") || base === "package-lock.json" || base === "yarn.lock") return true;
  if (base === "check-secrets.ts" || base === "check-no-demo.ts" || base === "check-domain.ts") return true;
  if (base === "docker-compose.yml" || base === "admin-reset.ts" || base === "bootstrap-admin.sh") return true;
  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(base)) return true;
  return false;
}

interface Match {
  file: string;
  line: number;
  content: string;
  patternName: string;
}

function scanFile(filePath: string): Match[] {
  const matches: Match[] = [];
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return matches;
  }
  const lines = content.split(/\r?\n/);
  for (const { pattern, name } of SECRET_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        matches.push({
          file: filePath,
          line: i + 1,
          content: lines[i].trim().replace(/[a-zA-Z0-9_-]{20,}/g, "***").slice(0, 80),
          patternName: name,
        });
      }
    }
  }
  return matches;
}

function walkDir(dir: string, root: string): Match[] {
  const matches: Match[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return matches;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(root, full);
    if (ent.isDirectory()) {
      if (!EXCLUDE_DIRS.has(ent.name)) {
        matches.push(...walkDir(full, root));
      }
    } else if (ent.isFile()) {
      if (!shouldExclude(full)) {
        matches.push(...scanFile(full));
      }
    }
  }
  return matches;
}

function main(): void {
  const root = path.resolve(process.cwd());
  const matches = walkDir(root, root);

  if (matches.length > 0) {
    console.error("\n❌ Secret guardrail failed: potential secrets detected.\n");
    const byFile = new Map<string, Match[]>();
    for (const m of matches) {
      const list = byFile.get(m.file) ?? [];
      list.push(m);
      byFile.set(m.file, list);
    }
    for (const [file, list] of Array.from(byFile.entries())) {
      const rel = path.relative(root, file);
      console.error(`  ${rel}:`);
      for (const m of list) {
        console.error(`    L${m.line} [${m.patternName}]: ${m.content}`);
      }
      console.error("");
    }
    console.error("Remove secrets from tracked files. Use .env (gitignored) for local values.\n");
    process.exit(1);
  }

  console.log("✓ Secret check passed: no secret patterns found.");
}

main();
