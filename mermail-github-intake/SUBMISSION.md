# Bounty submission — Mermail GitHub Intake

## What I built

**Mermail GitHub Intake** is a community Mermail agent skill that turns bug reports and feature requests arriving by email into safe, deduplicated GitHub issue drafts.

The core problem it addresses is that email is an open, adversarial input channel. A useful email-to-agent workflow therefore needs to extract engineering facts without allowing a sender to control the agent. This skill makes that trust boundary explicit.

## Demo

The included deterministic demo feeds the workflow a realistic bug report containing:

- observed and expected behaviour
- reproduction steps
- environment information
- an embedded instruction intended to redirect the agent
- a credential-like sentinel that must never reach the public issue

Running:

```bash
npm test
npm run demo
```

verifies that the workflow:

1. treats the message as untrusted data;
2. removes embedded instructions;
3. redacts sensitive content;
4. extracts the supported bug facts;
5. compares against existing issues for duplicates;
6. renders the exact proposed GitHub issue; and
7. stops at the approval boundary before any external write.

The recorded output is in `demo/demo-output.txt`.

## Mermail integration

The skill metadata points directly to Mermail's hosted MCP server:

`https://console.mermail.app/mcp`

A live agent uses Mermail to discover and read bounded inbox content, then standard GitHub tooling or a GitHub connector for duplicate lookup and issue creation.

## Security design

- Email content cannot select the target repository.
- Email content cannot authorize any write.
- Raw mail is never treated as shell code.
- Secrets, OTPs and credentials are withheld from issue previews.
- Links and attachments are never executed merely because an email requests it.
- GitHub writes require an exact preview and fresh approval.
- Outbound Mermail replies require a separate exact preview and fresh approval.
- Inbox discovery is deliberately bounded.

## Why it is useful

This turns a Mermail inbox into a practical software intake interface. Users, testers, customers, or automated systems can report a problem through ordinary email; the agent converts that report into structured engineering work while preserving the operator's control over public repository mutations.

## Status

The skill package, documentation, adversarial fixture, validator, and deterministic demo are complete. The local validation suite passes both structure/safety checks and the end-to-end fixture test.
