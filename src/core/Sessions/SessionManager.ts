import { REGISTER_IDLE } from "../../config/Config";
import { ISessionDataRow } from "./ISessionDataRow";
import { ActionType } from "../ActionType";
import { Session } from "./Session";

export class SessionManager {
    private static instance: SessionManager | null = null;
    private currentSession: Session;
    private oldSession!: Session;
    private currentAction: ActionType = ActionType.Idle;
    private menagedSessions : Session[] = [];

    static getInstance(): SessionManager {
        if (SessionManager.instance === null) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    private constructor() {
        this.currentSession = new Session();
    }

    public menageSession(actionType: ActionType): ISessionDataRow {
        this.currentAction = actionType;
        switch (actionType) {
            case ActionType.Codding:
            case ActionType.Debugging:
            case ActionType.Projecting:
            case ActionType.Documenting:
            case ActionType.Building:
            case ActionType.Testing:
                this.currentSession.start();
                return {
                    actionType: this.currentAction,
                    sessionInfo: this.currentSession.getSessionInfo(REGISTER_IDLE)
                };
            case ActionType.Idle:
                this.currentSession.idle();
                return {
                    actionType: this.currentAction,
                    sessionInfo: this.currentSession.getSessionInfo(REGISTER_IDLE)
                };
            case ActionType.Stop:
                this.currentSession.end();
                this.oldSession = this.currentSession;
                this.currentSession = new Session();
                return {
                    actionType: this.currentAction,
                    sessionInfo: this.oldSession.getSessionInfo(REGISTER_IDLE)
                };
        }
    }

    getSessionInfo(): ISessionDataRow {
        if (this.oldSession !== undefined && this.currentAction === ActionType.Stop) {
            return {
                sessionInfo: this.oldSession.getSessionInfo(REGISTER_IDLE),
                actionType: this.currentAction
            };
        }
        return {
            sessionInfo: this.currentSession.getSessionInfo(REGISTER_IDLE),
            actionType: this.currentAction
        };
    }

    

}
