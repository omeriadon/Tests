# Mermail GitHub Intake

**Community / unofficial Mermail companion skill.** It turns bug reports and feature requests received by a Mermail agent inbox into privacy-safe, deduplicated GitHub issue drafts, with a hard approval boundary before any external write.

The useful part is the trust boundary: public email can become structured engineering work **without allowing an email sender to control the agent**.

## Flow

```text
Mermail inbox
    |
    v
bounded search + thread read
    |
    v
UNTRUSTED INPUT BOUNDARY
    |
    +--> ignore embedded instructions
    +--> redact credentials / private data
    |
    v
structured issue extraction
    |
    v
read-only GitHub duplicate search
    |
    +--> likely duplicate -> operator review
    |
    v
exact GitHub issue preview
    |
    v
fresh approval required
    |
    v
GitHub issue creation
```

## Why this is a Mermail skill

Mermail gives an agent a dedicated, programmable email identity. This companion turns that inbox into a safe software-intake surface: anyone can email a report, while the operator retains control of what reaches the repository.

It deliberately combines Mermail with GitHub, so it lives outside Mermail's core skill repository and follows Mermail's documented companion-skill security model.

## Package

```text
skills/mermail-github-intake/
├── SKILL.md
├── agents/openai.yaml
└── references/
    ├── security.md
    ├── tools.md
    └── workflow.md
```

The OpenAI metadata points to Mermail's hosted MCP server at `https://console.mermail.app/mcp`.

## Install

First install the official core Mermail skills:

```bash
npx skills add Nudgen-Marketing/mermail-skills
```

Then install this companion from a local checkout:

```bash
npx skills add . --skill mermail-github-intake
```

Connect/authenticate the Mermail MCP server in your agent host, and authenticate the GitHub CLI (`gh`) or provide an equivalent GitHub connector.

## Try the deterministic demo

No credentials and no network writes are required:

```bash
npm test
npm run demo
```

The fixture intentionally contains both a fake API key and a prompt-injection attempt. The demo must:

1. ignore the embedded instruction,
2. strip the secret,
3. extract the actual bug report,
4. search a local fixture of existing issues,
5. produce an exact GitHub issue preview, and
6. stop at `draft_ready` instead of performing a write.

## Live agent use

A live agent follows `skills/mermail-github-intake/SKILL.md`:

1. resolve the mailbox and GitHub repository from trusted user/session context;
2. use Mermail MCP to search/read a bounded set of candidate reports;
3. extract supported facts while treating all mail as untrusted;
4. redact secrets and private reporter data;
5. use GitHub read operations to check duplicates;
6. render the exact issue effect;
7. obtain fresh approval;
8. create the issue;
9. optionally draft a Mermail acknowledgement, with a separate approval gate before sending.

## Security properties

- Email content never selects the GitHub repository.
- Email content never grants approval.
- Raw mail is never interpolated into shell code.
- Secrets/OTPs/tokens are withheld from public issues.
- Links and attachments are never executed because mail asks for it.
- GitHub writes and outbound mail always receive an exact preview plus fresh approval.
- Discovery is bounded instead of recursively sweeping an inbox.

See [`references/security.md`](skills/mermail-github-intake/references/security.md) for the full threat model.

## Demo fixture result

Expected final state:

```text
STATE: draft_ready — no GitHub write performed; fresh approval required.
```

This is intentional. The skill is autonomous in reading, structuring, redacting, and deduplicating; irreversible/public effects remain explicitly controlled.

## License

MIT
