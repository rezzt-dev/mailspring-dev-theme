# REZZT.DEV EDITORIAL DARK

a professional dark theme for mailspring based on the rezzt.dev editorial visual system.

## INSTALL

- download or clone this repository.
- install gilroy on the operating system. the theme deliberately references the locally licensed font instead of redistributing its commercial font files.
- in mailspring, open `install new theme...` and select the folder containing `package.json`.
- open `change theme...` and select `dev-dark`.
- optionally install `plugins/account-identities` with `developer → install a package manually...` for configurable account aliases and composer identity cues.
- optionally install `plugins/reading-mode` the same way for a focused reading layout and a density toggle.
- optionally install `plugins/focus-and-follow-up` for local reminders, reply detection, thread filters and a pending-work sidebar panel.
- optionally install `plugins/privacy-guard` for remote-image warnings and a review of tracking parameters before opening links.
- optionally install `plugins/contact-context` for local per-account contact notes, tags and thread statistics.

## DESIGN

- use gilroy at 12px across the native application interface.
- present every native interface label in lowercase.
- use `#080808` for the main canvas, `#101010`/`#111111` for surfaces and `#0d0d0d` for fields.
- keep the entire toolbar on `#101010`, with transparent column sections and matching selection overlays.
- assign `#080808` to the reading canvas and message list, `#101010` to navigation/cards/notes, and `#111111` to menus and popovers.
- use `#141414` for hover, `#1a1a1a` for selection, `#242424` plus a white marker for focus, and `#999999` for readable metadata/placeholders.
- reserve red for errors/danger and green for active status; informational notes and reminders stay neutral.
- emphasize mailspring's native attachment and send-reminder indicators with monochrome markers in the thread list.
- use white-alpha separators, square corners and monochrome inversion for interactive states.

received html emails and authored message content retain their original formatting and capitalisation. native window elements follow the operating system theme.

## FILES

- `styles/` contains the theme's less files.
- `assets/fonts/` retains legacy poppins assets for compatibility; the active interface font is the system-installed gilroy family.
- `plugins/account-identities/` contains the optional account-identity plugin and its local per-address configuration.
- `plugins/reading-mode/` contains the optional reading-layout plugin.
- `plugins/focus-and-follow-up/` contains the local productivity plugin and its tests.
- `plugins/privacy-guard/` contains image warnings and tracking-link review.
- `plugins/contact-context/` contains the local contact-context panel and tests.

licensed under mit.
