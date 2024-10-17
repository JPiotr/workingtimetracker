import assert from "assert";
import { Session } from "../../core/Sessions/Session";
import { SessionState } from "../../core/Sessions/SessionState";

suite('Session Tests', ()=>{
    let session : Session = new Session();
    test('Session is new',()=>{
        assert.strictEqual(session.isNewSession(), true);
    });
    test('Session is not new',()=>{
        session.start();
        assert.notStrictEqual(session.isNewSession(), true);
        session.end();
    });
});
suite('Session States Tests',()=>{
    let session : Session = new Session();
    test('Session not started',()=>{
        assert.strictEqual(session.sessionState === SessionState.Idle && session.isNewSession(), true);
    });
    test('Session is ongoing',()=>{
        session.start();
        assert.strictEqual(session.sessionState, SessionState.Ongoing);
    });
    test('Session is idle',()=>{
        session.idle();
        assert.strictEqual(session.sessionState, SessionState.Idle);
    });
    test('Session is not idle after started',()=>{
        session.start();
        assert.notStrictEqual(session.sessionState, SessionState.Idle);    
    });
    test('Session is ended',()=>{
        session.end();
        assert.strictEqual(session.sessionState, SessionState.Ended);    
    });
    test('Session started after ended',()=>{
        session.start();
        assert.strictEqual(session.sessionState, SessionState.Ongoing);    
        session.end();
    });
});