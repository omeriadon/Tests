import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'skills/mermail-github-intake');
const required = ['SKILL.md','agents/openai.yaml','references/security.md','references/tools.md','references/workflow.md'];
for (const rel of required) {
  if (!fs.existsSync(path.join(skillRoot, rel))) {
    console.error(`FAIL: missing ${rel}`);
    process.exit(1);
  }
}
const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
const yaml = fs.readFileSync(path.join(skillRoot, 'agents/openai.yaml'), 'utf8');
const checks = [
  ['frontmatter name', /name:\s*mermail-github-intake/, skill],
  ['untrusted-input rule', /untrusted data/i, skill],
  ['fresh approval', /fresh approval/i, skill],
  ['secret redaction', /redact/i, skill],
  ['bounded discovery', /at most 20/i, skill],
  ['Mermail MCP URL', /https:\/\/console\.mermail\.app\/mcp/, yaml],
  ['OpenAI skill invocation', /\$mermail-github-intake/, yaml]
];
for (const [name, re, haystack] of checks) {
  if (!re.test(haystack)) {
    console.error(`FAIL: ${name}`);
    process.exit(1);
  }
}
console.log('PASS: skill package structure and safety invariants validated.');
