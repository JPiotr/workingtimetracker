import * as vscode from "vscode";

export interface IBehaviorDetector {
  detectIdle(): vscode.Disposable[];
  // detectCodding(): vscode.Disposable[];
  detectDebuging(): vscode.Disposable[];
  // detectDocumenting(): vscode.Disposable[];
  detectTesting(): vscode.Disposable[];
  detectBuilding(): vscode.Disposable[];
}
