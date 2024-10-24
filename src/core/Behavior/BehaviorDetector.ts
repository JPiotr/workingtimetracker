import * as vscode from "vscode";
import { ActionType } from "../ActionType";
import { SessionManager } from "../Sessions/SessionManager";
import { IBehaviorDetector } from "./IBehaviorDetector";
import { DataStorageManager } from "../Data/DataStorageManager";

const documentationFiles = [".md", ".txt", ".json"];

export class BehaviorDetector implements IBehaviorDetector {
  public lastActive: number = 0;
  private sessionMenager: SessionManager = SessionManager.getInstance();
  private lastDetectedAction: ActionType = ActionType.Stop;
  private currentAction: ActionType = ActionType.Idle;
  private state: boolean = true;
  private static instance: BehaviorDetector;
  private isIdle: boolean = false;
  private constructor() {}
  //todo: testing detection also if files with 'test' are being edited
  static getInstance() {
    if (this.instance === undefined) {
      this.instance = new BehaviorDetector();
    }
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
        if (e.focused) {
          this.isIdle = false;
        } else {
          this.isIdle = true;
          this.lastDetectedAction = this.currentAction;
          this.currentAction = ActionType.Idle;
        }
        this.invokeManager();
      }),
    ];
  }
  detectCodding(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((e) => {
        if (!documentationFiles.some((x) => this.getFileName(e).includes(x))) {
          this.setNewAction(ActionType.Codding);
        }
      }),
      vscode.window.onDidChangeTextEditorSelection((e) => {
        if (
          !documentationFiles.some((x) =>
            this.getFileName(e.textEditor).includes(x)
          )
        ) {
          this.setNewAction(ActionType.Codding);
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
  detectDocumenting(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((e) => {
        if (documentationFiles.some((x) => this.getFileName(e).includes(x))) {
          this.setNewAction(ActionType.Documenting);
        }
      }),
      vscode.window.onDidChangeTextEditorSelection((e) => {
        if (
          documentationFiles.some((x) =>
            this.getFileName(e.textEditor).includes(x)
          )
        ) {
          this.setNewAction(ActionType.Documenting);
        }
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
  detectWorkspaceChanged() : vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((e) => {
        if(e !== undefined){
          const newUri = vscode.Uri.parse(e?.document.uri.path);
          if(DataStorageManager.currentWorkspace !== newUri){
            DataStorageManager.currentWorkspace = newUri;
          }
        }
      }),
    ];
  }
  private getFileName(textEditor: vscode.TextEditor | undefined): string {
    const fileName = textEditor?.document.fileName;
    return fileName === undefined ? "" : fileName;
  }
  idleUser() {
    if (this.currentAction !== ActionType.Idle && this.state) {
      this.lastDetectedAction = this.currentAction;
      this.currentAction = ActionType.Idle;
      this.isIdle = true;
      this.invokeManager();
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
  }
}
