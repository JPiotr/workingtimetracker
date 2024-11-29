# Change Log

All notable changes to the "workingtimetracker" extension will be documented in this file.

## [Unreleased]

- v1.3 - Detect on which branch user is working

## [1.2.0]

### Changed 

- Detecting actions now are under two event listeners
- Extendion Icon

## Added

- Option to decide if losing focus of vscode should be interpreted as Idle
- Visualization tool
- Store files extension under session information

## [1.1.5] - 2024 - 11 - 17

## Fixed

- Data not saving when no file is presented

## [1.1.4] - 2024 - 11 - 17

### Changed 

- Changed format of saving dates for vizualizaton purposes, old files created by extension will not work with upcoming visualization tool. 

## [1.1.3] - 2024 - 10 - 31

### Fixed

- #6 Overriding of daily sessions in file.

## [1.1.2] - 2024 - 10 - 29

### Added

- Extension icon

### Changed

- Readme

### Fixed

- Multiple workspaces handle
- Data loading (previously there was to much data loaded to RAM)

## [1.1.1] - 2024 - 10 - 25

### Changed 

- Readme 🫠

## [1.1.0] - 2024 - 10 - 25

### Added

- New extension configuration options
    - Documentation files extension that are analized to detect Documentation action
    - Decide if editing files with `test` in their name is also Testing action
- Detecting editing files with `test` in their name as Testing
- Store extension enums values in file
- Store part of user config

### Changed

- Location of time presenting in status bar to the left side
- Configuration in ms to minutes
- When editing or focused on workingtimetracker file extension will assume that user is idle
- Option for showing time with idle in status bar now defines only ui behavior
- Duration with idle time and without are separated in file

### Fixed

- Multiple workspaces support
- Idle sessions duration time was not saved properly

## [1.0.0] - 2024 - 10 - 20

### Added 

- Sessions system
- Session manager
- Behavior detect system
- Data storage