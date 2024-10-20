# Working Time Tracker

> Inspared by [Time Tracker](https://github.com/AlexBlade/vscode-time-tracker)

You want to register how much time You spend on projects? In free, opensource maner?

This is extension for You!

## Features

### Time register

Working Time Tracker, tracks time You spend on your programing project. All Your data is stored direcrly in Your workspace. 

It can register:

* Codding time 💻
* Debugging time 🪱
* Time spend on creating documentation in files like .md, .txt, .json 🗃️
* Testing time 🤖
* Building Your projects 🔨
* Idle time 😪

### Behavior detector

Extension detect what You are doing in Your project and decides if You are codding or You are afk on some coffie ☕.

### User data

If You want extension will on itself determine Who You are, and store data under Your github name. 🥸

If You don't want to allow this extension to get Your data from github, don't worry - it will read Your system profile username. 

### Mutli user support

You are a team player? A lot of codders, and testers work on Your project? 🙋

Extension can store working time of every person, and it will load only Your data to the memory. 


### Autosave

If You want it can autosave stored data in determined intervals. 💾

### Visualization

You have Your data stored, but how to read it? 
Coming soon!

## Extension Settings

This extension contributes the following settings:

* `workingtimetracker.innerSessions.registerIdle`: It defines if You want to see time sumarize with idle on status bar. 
* `workingtimetracker.innerSessions.uiRefreshTime`: Defines how ofen ui should refresh in ms.
* `workingtimetracker.innerSessions.autoSave`: Defines if You want autosave.
* `workingtimetracker.innerSessions.autoSaveTime`: Auto save interval in ms, default 15min.
* `workingtimetracker.innerSessions.idleTime`: Idle detection interval in ms, default 5min.
* `workingtimetracker.fileName`: Saved sessions filename.

## Todo

- [ ] Add some logo
- [ ] Create more tests
- [ ] Migrate hardcoded file extensions to configuration
- [ ] Visualization tool
- [ ] Determine on witch branch user is working

## Known Issues

Feel free to create some!

## Release Notes


### 1.0.0

Initial release of Working Time Tracker

