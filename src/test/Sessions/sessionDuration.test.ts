import assert from "assert";
import { SessionDuration } from "../../core/Sessions/SessionDuration";
import { SessionState } from "../../core/Sessions/SessionState";
import { beforeEach } from "mocha";

suite(`SessionDuration`, () => {
  let duration: SessionDuration;
  beforeEach(() => {
    duration = new SessionDuration();
    duration.start(SessionState.Ongoing);
  });
  test(`Should duration start`, () => {
    assert.equal(duration.getInfo().id !== undefined, true);
    duration.end();
  });
  test(`Should not register duration before end`, ()=>{
    assert.equal(duration.getDuration(),0);
  });
  test(`Should duration end`, async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    duration.end();
    assert.equal(duration.getDuration() >= 500, true);
  });
  test(`Should return current duration`, async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    assert.equal(duration.getCurrentDuration() > 500, true);
    duration.end();
  });
  test(`Should register duration state`, () => {
    duration.end();
    assert.equal(duration.getInfo().state, SessionState.Ongoing);
  });
  test(`Should return all information`, async ()=>{
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    duration.end();
    const info = duration.getInfo();
    assert.notEqual(info, undefined);
    assert.notEqual(info, null);
    assert.notEqual(info.id,"");
    assert.equal(info.duration > 500, true);
    assert.equal(info.state, SessionState.Ongoing);
    assert.equal(info.begin < info.end, true);
  })
});
