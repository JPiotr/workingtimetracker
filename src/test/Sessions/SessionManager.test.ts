import assert from "assert";
import { SessionManager } from "../../core/Sessions/SessionManager";
import { ISessionDataRow } from "../../core/Sessions/ISessionDataRow";
import { ActionType } from "../../core/ActionType";
import { Session } from "../../core/Sessions/Session";

suite(`SessionManager`, () => {
  test(`Should return instance`, () => {
    assert.notEqual(SessionManager.getInstance(), undefined);
  });
  test(`Should load menaged sessions`, () => {
    const s1 = new Session();
    const s2 = new Session();
    s1.start();
    s2.start();
    const data: ISessionDataRow[] = [
      {
        actionType: ActionType.Building,
        sessionInfo: s1.getSessionInfo(),
      },
      {
        actionType: ActionType.Stop,
        sessionInfo: s2.getSessionInfo(),
      },
    ];
    SessionManager.getInstance().loadManagedSessions(data);
    s1.end();
    s2.end();
    assert.equal(
      SessionManager.getInstance().getCurrentlyManagedSessions().length,
      data.length + 1
    );
  });
  test(`Should menage session`, () => {
    SessionManager.getInstance().menageSession(ActionType.Codding);
    assert.equal(
      SessionManager.getInstance().getSessionInfo().actionType,
      ActionType.Codding
    );
    SessionManager.getInstance().menageSession(ActionType.Idle);
    assert.equal(
      SessionManager.getInstance().getSessionInfo().actionType,
      ActionType.Idle
    );
    SessionManager.getInstance().menageSession(ActionType.Stop);
    assert.equal(
      SessionManager.getInstance().getSessionInfo().actionType,
      ActionType.Stop
    );
  });
});
