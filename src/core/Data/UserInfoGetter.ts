import { userInfo } from 'os';
import * as vscode from 'vscode';
export class UserInfoGetter {
     username : string = userInfo().username;
    constructor(){
    }
    private async getGithubInfo() {
        await vscode.authentication
          .getSession(Providers.GITHUB, ['user:email'], { createIfNone: true })
          .then((fullfiled) => {
            this.username = fullfiled.account.label;
          },()=>{
            vscode.window.showInformationMessage("Github username cannot be retrive.")
          });
    }
    async getUsername(){
        await this.getGithubInfo();
        return this.username;
    }
}

export enum Providers {
    GITHUB = 'github',
    MICROSOFT = 'microsoft'
}