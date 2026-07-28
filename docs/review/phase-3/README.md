# Phase 3 UI review artifacts

The screenshots below were captured from the localized Vietnamese homepage
with the repository's Playwright installation.

| Artifact                 | Viewport or state                |
| ------------------------ | -------------------------------- |
| `baseline-desktop.png`   | Phase 2 baseline at 1440 px      |
| `desktop-light.png`      | 1440 × 1200, light theme         |
| `laptop-light.png`       | 1024 × 900, light theme          |
| `tablet-light.png`       | 768 × 1024, light theme          |
| `mobile-light.png`       | 390 × 844, light theme           |
| `desktop-dark.png`       | 1440 × 1200, dark theme          |
| `search-empty-light.png` | Search empty state at 1024 × 900 |

The homepage seed includes a long Vietnamese headline and posts without CMS
cover images, so the captures also exercise long-copy wrapping and
deterministic fallback artwork.

These are review captures rather than pixel-diff baselines. Production Core
Web Vitals were not claimed because the repository does not define a stable
network or device lab profile. The implementation avoids full rich-text
payloads, bounds all homepage queries, prioritizes only the featured image,
and limits client JavaScript to the public-shell interactions.
