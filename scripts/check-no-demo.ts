#!/usr/bin/env tsx
/**
 * No-demo guardrail: fails build if banned demo indicators appear in the repo.
 * Banned: demo mode, DEMO_MODE, isDemo, /demo, demoData, seedData, fixture,
 * mockData, dummyData, sampleData, bypass (in production paths).
 *
 * Excludes: node_modules, .next, .git, tests/, __tests__, *.test.*, *.spec.*.
 * Run via: npm run check:nodemo or prebuild.
 */
import * as fs from "fs";
import * as path from "path";

const BANNED_PATTERNS = [
  { pattern: /demo\s*mode/i, name: "demo mode" },
  { pattern: /DEMO_MODE/, name: "DEMO_MODE" },
  { pattern: /\bisDemo\b/, name: "isDemo" },
  { pattern: /["'`]\/demo["'`\/]/, name: "/demo route" },
  { pattern: /\bdemoData\b/, name: "demoData" },
  { pattern: /\bseedData\b/, name: "seedData" },
  { pattern: /\bfixture\b/, name: "fixture" },
  { pattern: /\bmockData\b/, name: "mockData" },
  { pattern: /\bdummyData\b/, name: "dummyData" },
  { pattern: /\bsampleData\b/, name: "sampleData" },
  { pattern: /\bbypass\b/, name: "bypass" },
  { pattern: /\bDEMO_SITE_SETTINGS\b/, name: "DEMO_SITE_SETTINGS" },
  { pattern: /\bDEMO_PRODUCTS\b/, name: "DEMO_PRODUCTS" },
  { pattern: /\bDEMO_PAYMENT_GATEWAYS\b/, name: "DEMO_PAYMENT_GATEWAYS" },
  { pattern: /\bDEMO_ORDERS\b/, name: "DEMO_ORDERS" },
  { pattern: /\bDEMO_ANALYTICS\b/, name: "DEMO_ANALYTICS" },
  { pattern: /\bdemo_session\b/, name: "demo_session" },
  { pattern: /\bdemo-login\b/, name: "demo-login" },
  { pattern: /\bdemo-logout\b/, name: "demo-logout" },
  { pattern: /AUTH_MODE\s*===\s*["']demo["']/, name: "AUTH_MODE === demo" },
];

const EXCLUDE_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "build", ".turbo",
  "coverage", "test-results", "playwright-report", "legacy-data",
  "_backup", "pet product", "mcps", "_archive",
]);
const EXCLUDE_FILE_PATTERNS = [
  /\.test\.(ts|tsx|js|jsx)$/,
  /\.spec\.(ts|tsx|js|jsx)$/,
  /jest\.config/,
  /check-no-demo\.ts$/,
  /check-domain\.ts$/,
];

function shouldExclude(filePath: string): boolean {
  const parts = filePath.split(path.sep);
  if (parts.some((p) => EXCLUDE_DIRS.has(p))) return true;
  if (parts.includes("tests") || parts.includes("__tests__")) return true;
  const base = path.basename(filePath);
  if (EXCLUDE_FILE_PATTERNS.some((re) => re.test(base))) return true;
  const ext = path.extname(filePath).toLowerCase();
  if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) return true;
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
  for (const { pattern, name } of BANNED_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        matches.push({
          file: filePath,
          line: i + 1,
          content: lines[i].trim().slice(0, 120),
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
    console.error("\n❌ No-demo guardrail failed: banned demo indicators found.\n");
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
    console.error("Remove demo mode, demo data, and demo bypasses from production code.\n");
    process.exit(1);
  }

  console.log("✓ No-demo check passed: no banned indicators found.");
}

main();
