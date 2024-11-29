import * as vscode from "vscode";
import { ActionType } from "../ActionType";
import { SessionManager } from "../Sessions/SessionManager";
import { IBehaviorDetector } from "./IBehaviorDetector";
import { DataStorageManager } from "../Data/DataStorageManager";

export class BehaviorDetector implements IBehaviorDetector {
  public lastActive: number = 0;
  private sessionMenager: SessionManager = SessionManager.getInstance();
  private lastDetectedAction: ActionType = ActionType.Stop;
  private currentAction: ActionType = ActionType.Idle;
  private state: boolean = true;
  private static instance: BehaviorDetector;
  private isIdle: boolean = false;
  private config!: vscode.WorkspaceConfiguration;
  private currentFile: string = "";

  private constructor() {}

  static getInstance() {
    if (this.instance === undefined) {
      this.instance = new BehaviorDetector();
    }
    this.instance.config =
      vscode.workspace.getConfiguration("workingtimetracker");
    return this.instance;
  }

  isDetectedNewAction(): boolean {
    return this.currentAction !== this.lastDetectedAction;
  }
  detectIdle(): vscode.Disposable[] {
    return [
      vscode.debug.onDidTerminateDebugSession(() => {
        this.setNewAction(ActionType.Idle);
      }),
      vscode.tasks.onDidEndTask(() => {
        this.setNewAction(ActionType.Idle);
      }),
      vscode.tasks.onDidEndTaskProcess(() => {
        this.setNewAction(ActionType.Idle);
      }),
      vscode.window.onDidChangeWindowState((e) => {
        if (this.config.behaviorDetector.idleWhenLostFocus){
          if (e.focused) {
            this.isIdle = false;
          } else {
            this.isIdle = true;
            this.lastDetectedAction = this.currentAction;
            this.currentAction = ActionType.Idle;  
          }
          this.invokeManager();
        }
      }),
    ];
  }
  detectActions(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((e) => {
        this.updateConfig();
        if(e === undefined) return;
        const fileName = this.getFileName(e).toLowerCase();
        if (fileName.includes(this.config.fileName)) {
          this.setNewAction(ActionType.Idle);
        }
        if (
          !this.config.behaviorDetector.doumentationFilesExt.some((x: string) =>
            fileName.includes(x)
          ) &&
          !fileName.includes("test") &&
          !fileName.includes(this.config.fileName)
        ) {
          this.setNewAction(ActionType.Codding);
        }
        if (
          !fileName.includes(this.config.fileName) &&
          !fileName.includes("test") &&
          this.config.behaviorDetector.doumentationFilesExt.some((x: string) =>
            fileName.includes(x)
          )
        ) {
          this.setNewAction(ActionType.Documenting);
        }
        if (
          this.config.behaviorDetector.detectTestingWhileEditingTestFile &&
          fileName.includes("test")
        ) {
          this.setNewAction(ActionType.Testing);
        }
      }),
      vscode.window.onDidChangeTextEditorSelection((e) => {
        this.updateConfig();
        if (e === undefined) return;
        const fileName = this.getFileName(e.textEditor).toLowerCase();
        if (
          fileName.includes(this.config.fileName)
        ) {
          this.setNewAction(ActionType.Idle);
        }
        if (
          !fileName.includes(this.config.fileName) &&
          !fileName.includes("test") &&
          !this.config.behaviorDetector.doumentationFilesExt.some((x: string) =>
            fileName.includes(x)
          )
        ) {
          this.setNewAction(ActionType.Codding);
        }
        if (
          !fileName.includes(this.config.fileName) &&
          !fileName.includes("test") &&
          this.config.behaviorDetector.doumentationFilesExt.some((x: string) =>
            fileName.includes(x)
          )
        ) {
          this.setNewAction(ActionType.Documenting);
        }
        if (
          this.config.behaviorDetector.detectTestingWhileEditingTestFile &&
          fileName.includes("test")
        ) {
          this.setNewAction(ActionType.Testing);
        }
      }),
    ];
  }
  detectDebuging(): vscode.Disposable[] {
    return [
      vscode.debug.onDidStartDebugSession(() => {
        this.setNewAction(ActionType.Debugging);
      }),
      vscode.debug.onDidChangeActiveDebugSession(() => {
        this.setNewAction(ActionType.Debugging);
      }),
      vscode.debug.onDidChangeBreakpoints(() => {
        this.setNewAction(ActionType.Debugging);
      }),
    ];
  }
  detectTesting(): vscode.Disposable[] {
    return [
      vscode.tasks.onDidStartTask((task) => {
        if (task.execution.task.name.toLowerCase().includes("test")) {
          this.setNewAction(ActionType.Testing);
        }
      }),
      vscode.tasks.onDidStartTaskProcess((task) => {
        if (task.execution.task.name.toLowerCase().includes("test")) {
          this.setNewAction(ActionType.Testing);
        }
      }),
    ];
  }
  detectBuilding(): vscode.Disposable[] {
    return [
      vscode.tasks.onDidStartTask(() => {
        this.setNewAction(ActionType.Building);
      }),
      vscode.tasks.onDidStartTaskProcess(() => {
        this.setNewAction(ActionType.Building);
      }),
    ];
  }
  detectWorkspaceChanged(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((e) => {
        if (e !== undefined) {
          const newUri = vscode.Uri.parse(e.document.uri.path);
          const folder = vscode.workspace.getWorkspaceFolder(newUri);
          if(folder != undefined && DataStorageManager.currentWorkspace !== folder.uri){
            SessionManager.getInstance().menageSession(ActionType.Stop);
            DataStorageManager.getInstance().saveData().then(()=>{
              SessionManager.getInstance().resetSessionsInfo();
              DataStorageManager.currentWorkspace = folder.uri;
              DataStorageManager.getInstance().updateFilePath();
              DataStorageManager.getInstance().resetStorage()
              return DataStorageManager.getInstance().loadData();
            }).then(()=>{}).catch((err)=>{vscode.window.showErrorMessage(err)});
          }
          return;
        }
      }),
    ];
  }
  private getFileName(textEditor: vscode.TextEditor | undefined): string {
    if(textEditor === undefined) return "";
    const fileName = textEditor?.document.fileName;
    if(fileName === undefined){
      this.currentFile = "";
      return "";
    }
    if (fileName == this.config.fileName){
      this.currentFile = fileName;
    }else{
      const index = fileName.indexOf(".");
      this.currentFile = fileName.substring(index, fileName.length);
    }
    return fileName.toLowerCase();
  }
  idleUser() {
    if (this.currentAction !== ActionType.Idle && this.state) {
      this.lastDetectedAction = this.currentAction;
      this.currentAction = ActionType.Idle;
      this.isIdle = true;
    }
    this.invokeManager();
  }
  private setNewAction(action: ActionType) {
    if (this.currentAction !== action && this.state) {
      this.lastActive = Date.now();
      this.lastDetectedAction = this.currentAction;
      this.currentAction = action;
      this.isIdle = false;
      this.invokeManager();
    }
  }
  private invokeManager(): void {
    if (this.isDetectedNewAction()) {
      this.sessionMenager.menageSession(this.currentAction);
    }
    this.sessionMenager.registerFileExt(this.currentFile);
  }
  private updateConfig(): void {
    this.config = vscode.workspace.getConfiguration("workingtimetracker");
  }
}
