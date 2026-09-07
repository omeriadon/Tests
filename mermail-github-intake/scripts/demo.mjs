import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const check = process.argv.includes('--check');
const report = JSON.parse(fs.readFileSync(path.join(root, 'demo/inbound-report.json'), 'utf8'));
const existing = JSON.parse(fs.readFileSync(path.join(root, 'demo/existing-issues.json'), 'utf8'));

const injectionPatterns = [
  /ignore\s+(all\s+)?previous\s+instructions/ig,
  /embedded instruction test:[^\n]*/ig,
  /change\s+the\s+target\s+repo[^\n]*/ig,
  /run\s+curl[^\n]*/ig
];
const secretPatterns = [
  /DEMO_SECRET_VALUE_SHOULD_NOT_BE_PUBLISHED\.?/g,
  /\bsk-[A-Za-z0-9_-]{8,}\b/g,
  /\b(?:api[_ -]?key|token|password)\s*(?:is|=|:)\s*[^\s]+/ig
];

function redact(text) {
  let out = text;
  for (const pattern of injectionPatterns) out = out.replace(pattern, '[UNTRUSTED INSTRUCTION REMOVED]');
  for (const pattern of secretPatterns) out = out.replace(pattern, '[SECRET REDACTED]');
  return out;
}

function section(body, label, nextLabels) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const next = nextLabels.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`${escaped}:\\s*([\\s\\S]*?)(?=\\n\\n(?:${next}):|$)`, 'i');
  return (body.match(re)?.[1] ?? '').trim();
}

function words(s) {
  return new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3));
}

function similarity(a, b) {
  const A = words(a), B = words(b);
  const intersection = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? intersection / union : 0;
}

const safeBody = redact(report.body);
const observed = section(safeBody, 'Observed', ['Expected', 'Steps', 'Environment']);
const expected = section(safeBody, 'Expected', ['Steps', 'Environment']);
const stepsRaw = section(safeBody, 'Steps', ['Environment']);
const environmentBlock = section(safeBody, 'Environment', ['zzzz-never']);
const environment = environmentBlock.split(/\n\s*\n/)[0].trim();
const steps = stepsRaw.split('\n').map(s => s.trim()).filter(Boolean);

const title = report.subject.trim().replace(/[\r\n]+/g, ' ').slice(0, 120);
const candidateText = `${title} ${observed} ${expected}`;
const ranked = existing
  .map(issue => ({ ...issue, score: similarity(candidateText, `${issue.title} ${issue.body}`) }))
  .sort((a, b) => b.score - a.score);
const duplicate = ranked[0]?.score >= 0.46 ? ranked[0] : null;

const issueBody = [
  '## Summary',
  title,
  '',
  '## Observed behavior',
  observed || 'Not provided.',
  '',
  '## Expected behavior',
  expected || 'Not provided.',
  '',
  '## Reproduction steps',
  ...(steps.length ? steps : ['Not provided.']),
  '',
  '## Environment',
  environment || 'Not provided.',
  '',
  '---',
  `Source: Mermail thread \`${report.threadId}\`, message \`${report.messageId}\`.`,
  '',
  '> Reporter address intentionally omitted. Potential secrets and embedded instructions were not copied into this draft.'
].join('\n');

if (/DEMO_SECRET_VALUE_SHOULD_NOT_BE_PUBLISHED|embedded instruction test/i.test(issueBody)) {
  console.error('FAIL: untrusted or secret content leaked into issue draft');
  process.exit(1);
}

if (check) {
  if (!observed || !expected || steps.length < 3 || !environment) {
    console.error('FAIL: expected report fields were not extracted');
    process.exit(1);
  }
  if (duplicate) {
    console.error(`FAIL: fixture should remain unique, but matched #${duplicate.number} at ${duplicate.score.toFixed(2)}`);
    process.exit(1);
  }
  console.log('PASS: bounded intake demo produced a unique, redacted draft and stopped at the approval gate.');
  process.exit(0);
}

console.log('Mermail GitHub Intake — deterministic safety demo');
console.log('===================================================');
console.log(`source: ${report.threadId}/${report.messageId}`);
console.log('trust: inbound message treated as untrusted data');
console.log(`redaction: ${safeBody.includes('[SECRET REDACTED]') ? 'secret removed' : 'no secret found'}`);
console.log(`injection: ${safeBody.includes('[UNTRUSTED INSTRUCTION REMOVED]') ? 'embedded instruction ignored' : 'none found'}`);
console.log(`duplicates searched: ${existing.length}`);
console.log(`duplicate result: ${duplicate ? `likely #${duplicate.number}` : 'none above threshold'}`);
console.log('\nEXACT EFFECT PREVIEW');
console.log('--------------------');
console.log('repository: example/acme');
console.log(`title: ${title}`);
console.log(issueBody);
console.log('\nSTATE: draft_ready — no GitHub write performed; fresh approval required.');
