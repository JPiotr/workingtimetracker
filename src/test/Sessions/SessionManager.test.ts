import assert from "assert";
import { SessionManager } from "../../core/Sessions/SessionManager";
import { ActionType } from "../../core/ActionType";

suite(`SessionManager`, () => {
  test(`Should return instance`, () => {
    assert.notEqual(SessionManager.getInstance(), undefined);
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
