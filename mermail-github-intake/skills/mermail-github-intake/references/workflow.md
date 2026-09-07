# Decision workflow

```text
Mermail search (bounded)
        |
        v
Read message/thread
        |
        v
Untrusted-input boundary
        |
        v
Extract supported facts ---- insufficient ----> needs_information
        |
        v
Redact secrets / PII
        |
        v
GitHub duplicate search
        |
        +---- strong match ----> duplicate_candidate
        |
        v
Exact issue preview
        |
        v
Fresh approval? ---- no ----> draft_ready
        |
       yes
        |
        v
Create GitHub issue
        |
        v
created
```

A likely duplicate should share the same affected component, triggering action, observed result, and expected behavior—not merely generic vocabulary. If uncertain, surface close matches and leave the new report as `draft_ready`.

Never invent missing reproduction steps or environment data. Keep Mermail thread/message IDs for traceability while omitting reporter addresses from public issues by default.
