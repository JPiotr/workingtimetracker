# Working Time Tracker

> Inspared by [Time Tracker](https://github.com/AlexBlade/vscode-time-tracker)

You want to register how much time You spend on projects? In free, opensource maner?

This is extension for You!

## Features

### Time register

Working Time Tracker, tracks time You spend on your programming project. All Your data is stored direcrly in Your workspace. 

It can register:

* Codding time 💻
* Debugging time 🪱
* Time spend on creating documentation in files like .md, .txt, .json  (witch is also configurable) 🗃️
* Testing time 🤖
* Building Your projects 🔨
* Idle time 😪

### Behavior detector

Extension detect what You are doing in Your project and decides if You are codding or You are away on some coffie ☕.

### Workspaces support

You are working on many workspaces at the same time - now it will detect that and create new file for every workspace. 📚

### User data

If You want extension will on itself determine Who You are, and store data under Your github name. 🥸

If You don't want to allow this extension to get Your data from github, don't worry - it will read Your system profile username. 

### Mutli user support

You are a team player? A lot of codders and testers work on Your project? 🙋

Extension can store working time of every person and it will load only Your data to the memory. 


### Autosave

If You want it can autosave stored data in determined intervals. 💾

### Visualization

You have Your data stored but how to read it? 
Here is [visualization tool](https://jpiotr.github.io/workingtimetracker_ui/) for You! 

![visualization tool](images/visualizationTool.png) 

And [CLI visualization tool](https://github.com/JPiotr/WTTCLIVisualizer)!

![cli visualization tool](images/cliVisualizationTool.png)
## Extension Settings

This extension contributes the following settings:

* `workingtimetracker.innerSessions.registerIdle`: It defines if You want to see time sumarize with idle on status bar. 
* `workingtimetracker.innerSessions.uiRefreshTime`: Defines how ofen UI should refresh in ms.
* `workingtimetracker.innerSessions.autoSave`: Defines if You want autosave.
* `workingtimetracker.innerSessions.autoSaveTime`: Auto save interval in minutes, default 15min.
* `workingtimetracker.innerSessions.idleTime`: Idle detection interval in minutes, default 5min.
* `workingtimetracker.fileName`: Saved sessions filename.
* `workingtimetracker.behaviorDetector.doumentationFilesExt`: Array of files extension that are involved in creating documentation.
* `workingtimetracker.behaviorDetector.detectTestingWhileEditingTestFile`: Defines if You want detector to treat editing file with `test` in their name to be in testing category.
* `workingtimetracker.behaviorDetector.idleWhenLostFocus`: Defines if You want detector to assume losing focus vscode as idle time.

## Known Issues

Feel free to create some!

## Release Notes

### 1.2.0

New relase is out! 
Look at the changelog file for more details!

### 1.1.2

There was some bugs fixes and icon was added also performace was improved. 
More info traditionaly in changelog 🫡.


### 1.1.0

Here it comes, after using it for a while I spotted some bugs and I decide to add some new features. 
See changelog for more informations. 😁

### 1.0.0

Initial release of Working Time Tracker

