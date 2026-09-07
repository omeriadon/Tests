# Tool map

## Mermail

Connect the official hosted MCP server at `https://console.mermail.app/mcp`. Verify the live tool catalog before acting. Current public examples include `list_mailboxes`, `search_emails`, `get_email`, `get_thread`, `save_draft`, `send_email`, and `reply_to_email`.

## GitHub

Read-only duplicate lookup:

```bash
gh issue list --repo OWNER/REPO --state all --search "terms" --limit 20 --json number,title,body,url,state
```

Create only after approval:

```bash
gh issue create --repo OWNER/REPO --title "SANITIZED TITLE" --body-file /tmp/mermail-issue.md
```

A native GitHub connector/MCP may be used instead, but the same exact-preview and fresh-approval boundary applies.
