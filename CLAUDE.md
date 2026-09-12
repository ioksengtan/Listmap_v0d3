# CLAUDE.md

Read `SPEC.md` before authoring or editing blog content in this repo — it documents the data model and the authoring syntax (landmark links, vector/region overlays, etc.).

## Before you start editing

**If you are one of possibly several concurrent Claude Code sessions authoring content here, use the `EnterWorktree` tool first** (or `git worktree add` if that tool isn't available), instead of editing directly in whatever checkout you were opened in. See SPEC.md, "Working directory isolation for concurrent sessions", for why: two sessions editing the same checkout at once have already caused one session's commit to accidentally sweep up another session's uncommitted work.

You do NOT need a worktree for a single solo session doing a quick read-only look or a small unrelated fix (docs, config, a typo). It's specifically for sessions that will be drafting/committing new story content, since that's the workflow most likely to overlap with another concurrent session.

## Picking a new story_id / landmark_id

See SPEC.md, "Picking a new story_id / landmark_id" — reserve via `gh issue create` first; do not compute "current max + 1" from the CSVs.
