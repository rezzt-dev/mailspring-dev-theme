# rezzt.dev editorial dark

a professional dark theme for mailspring based on the rezzt.dev editorial visual system.

## install

- download or clone this repository.
- install gilroy on the operating system. the theme deliberately references the locally licensed font instead of redistributing its commercial font files.
- in mailspring, open `install new theme...` and select the folder containing `package.json`.
- open `change theme...` and select `dev-dark`.
- optionally install `plugins/short-account-labels` with `developer → install a package manually...` to shorten account headings without renaming accounts.

## design

- use gilroy at 12px across the native application interface.
- present every native interface label in lowercase.
- use `#121212` for the main canvas, `#1a1a1a`/`#1b1b1b` for surfaces and `#141414` for fields.
- use white-alpha separators, square corners and monochrome inversion for interactive states.

received html emails and authored message content retain their original formatting and capitalisation. native window elements follow the operating system theme.

## files

- `styles/` contains the theme's less files.
- `assets/fonts/` retains legacy poppins assets for compatibility; the active interface font is the system-installed gilroy family.
- `plugins/short-account-labels/` contains the optional account-label companion plugin.

licensed under mit.
