# Change Log

All notable changes to the "workingtimetracker" extension will be documented in this file.

## [Unreleased]

- v1.2 - Detect on witch branch user is working
- v1.2 - Detect on witch type of files user is working (analize and store only files extensions)
- v1.2 - Add visualization tool

## [1.1.1] - 2024 - 10 - 25

### Changed 

- Readme 🫠

## [1.1.0] - 2024 - 10 - 25

### Changed

- Location of time presenting in status bar to the left side
- Configuration in ms to minutes
- When editing or focused on workingtimetracker file extension will assume that user is idle
- Option for showing time with idle in status bar now defines only ui behavior
- Duration with idle time and without are separated in file

### Added

- New extension configuration options
    - Documentation files extension that are analized to detect Documentation action
    - Decide if editing files with `test` in theri name is also Testing action
- Detecting editing files with `test` in their name as Testing
- Store extension enums values in file
- Store part of user config

### Fixed

- Multiple workspaces support
- Idle sessions duration time was not saved properly

## [1.0.0] - 2024 - 10 - 20

### Added 

- Sessions system
- Session manager
- Behavior detect system
- Data storage