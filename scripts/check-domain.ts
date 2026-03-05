#!/usr/bin/env tsx
/**
 * Domain guardrail: fails build if forbidden domains appear in the repo.
 * Allowed: citypetshop.bd, www.citypetshop.bd, localhost, 127.0.0.1.
 * Forbidden: citypetshopbd.com, citypluspetshop.com (unless in email: x@domain).
 *
 * Excludes: node_modules, .next, .git, lock files, binary files.
 * Run via: npm run check:domain or prebuild.
 */
import * as fs from "fs";
import * as path from "path";

const FORBIDDEN_DOMAINS = [
  "citypetshopbd.com",
  "citypluspetshop.com",
  "www.citypetshopbd.com",
  "www.citypluspetshop.com",
];

const EXCLUDE_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", ".turbo",
  "legacy-data", "pet product", "_backup", "coverage", "test-results", "playwright-report",
]);
const SCAN_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".json", ".env", ".example", ".conf"]);

function shouldExclude(filePath: string): boolean {
  const parts = filePath.split(path.sep);
  if (parts.some((p) => EXCLUDE_DIRS.has(p))) return true;
  const base = path.basename(filePath).toLowerCase();
  if (base === "check-domain.ts") return true;
  const ext = path.extname(filePath).toLowerCase();
  const hasValidExt = SCAN_EXT.has(ext) || base.endsWith(".env.example") || base.endsWith(".production.example");
  if (!hasValidExt) return true;
  return false;
}

/** Match forbidden domain when NOT part of an email (not preceded by @). */
function buildRegex(domain: string): RegExp {
  const escaped = domain.replace(/\./g, "\\.");
  return new RegExp(`(?<!@)${escaped}`, "gi");
}

interface Match {
  file: string;
  line: number;
  content: string;
  domain: string;
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
  for (const domain of FORBIDDEN_DOMAINS) {
    const re = buildRegex(domain);
    for (let i = 0; i < lines.length; i++) {
      if (re.test(lines[i])) {
        matches.push({
          file: filePath,
          line: i + 1,
          content: lines[i].trim().slice(0, 100),
          domain,
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
    console.error("\n❌ Domain guardrail failed: forbidden domain(s) found.\n");
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
        console.error(`    L${m.line}: ${m.domain} — ${m.content}`);
      }
      console.error("");
    }
    console.error("Allowed domains: citypetshop.bd, www.citypetshop.bd");
    console.error("Contact email (info@...) is centralized in lib/constants.ts — change there if needed.\n");
    process.exit(1);
  }

  console.log("✓ Domain check passed: no forbidden domains found.");
}

main();
