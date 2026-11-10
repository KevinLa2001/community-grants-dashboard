# Community Grant Watch

A GitHub Pages dashboard that tracks community grant opportunities from Seattle, King County, Washington State, and Microsoft. It shows the official grant state, deadline, and the internal submission stage:

`Researching` → `Eligible` → `Drafting` → `Ready for review` → `Submitted` → `Awarded` / `Declined`

## Keeping data current

`Update grant sources` runs hourly and checks every official source, then republishes `data/grants.json`. The dashboard always displays the last successful source check. A source that cannot be reached is visibly marked **Needs review** rather than silently treated as current.

To update grant metadata or submission status, edit `data/sources.json`. Use official source pages only; enter a deadline only once it is published by that source.

## Publish on GitHub Pages

1. Create a new GitHub repository named `community-grants-dashboard`.
2. Push this folder's `main` branch to that repository.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. In **Actions**, run **Update grant sources** once. Scheduled updates then run every six hours.

GitHub Pages is static hosting, so it cannot promise instantaneous third-party updates. The hourly automated source check makes freshness explicit and detects unavailable sources.
