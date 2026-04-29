# SQL Update Guide

Use this when editing `backend/src/db/init.sql`.

## Required insert order from file comments

1. Add new `librarians` rows above the comment: "To insert future librarians..."
2. Add new `subjects` rows above the comment: "To insert future subjects..."
3. Add at least one `librarian_subjects` row for every new librarian (required by final comment).

## Rules

- Keep existing insert order stable so expected IDs remain predictable.
- `npm run db:init` is destructive (`DROP DATABASE IF EXISTS wayfinder`); back up first.
- After updates, re-run init and verify search:

```bash
cd backend
npm run db:init
curl -s "http://localhost:5000/api/search?q=<new_name_or_subject>"
```
