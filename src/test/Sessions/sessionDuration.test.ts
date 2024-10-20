import assert from "assert";
import { SessionDuration } from "../../core/Sessions/SessionDuration";

suite(`SessionDuration`, () => {
  test(`Should duration start`, () => {
    const duration: SessionDuration = new SessionDuration();
    duration.start();
    assert.equal(duration.getInfo().id !== undefined, true);
  });
  test(`Should duration end`, () => {
    const duration: SessionDuration = new SessionDuration();
    duration.start();
    setTimeout(() => {
      duration.end();
      assert.equal(duration.getDuration() > 1000, true);
    }, 1000);
  });
  test(`Should return current duration`, () => {
    const duration: SessionDuration = new SessionDuration();
    duration.start();
    setTimeout(() => {
      assert.equal(duration.getCurrentDuration() < 1000, true);
      duration.end();
    }, 1000);
  });
});
