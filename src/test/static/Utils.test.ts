import assert from "assert";
import { convertStringToTime, convertTimeToString } from "../../static/Utils";

suite(`Utils`, () => {
  suite(`Convert string to ms`, () => {
    test(`Should convert string seconds to ms`, () => {
      assert.equal(convertStringToTime("00:00:20"), 20000);
    });
    test(`Should convert string minutes and seconds to ms`, () => {
      assert.equal(convertStringToTime("00:10:20"), 620000);
    });
    test(`Should convert string hours and minutes and seconds to ms`, () => {
      assert.equal(convertStringToTime("05:10:20"), 18620000);
    });
    test(`Should convert string time to ms`, () => {
      assert.equal(convertStringToTime("50:10:20"), 180620000);
    });
    test(`Should convert string long time to ms`, () => {
      assert.equal(convertStringToTime("150:10:20"), 540620000);
    });
    test(`Should return 0 time ms`, () => {
      assert.equal(convertStringToTime("00:00:00"), 0);
    });
    test(`Should not convert negative time`, () => {
      assert.throws(() => {
        convertStringToTime("-00:00:10");
      });
    });
  });
  suite(`Convert ms to string`, () => {
    test(`Should convert ms seconds to string`, () => {
      assert.equal(convertTimeToString(20000), "00:00:20");
    });
    test(`Should convert ms minutes and seconds to string`, () => {
      assert.equal(convertTimeToString(620000), "00:10:20");
    });
    test(`Should convert ms hours and minutes and seconds to string`, () => {
      assert.equal(convertTimeToString(18620000), "05:10:20");
    });
    test(`Should convert string time to ms`, () => {
      assert.equal(convertTimeToString(180620000), "50:10:20");
    });
    test(`Should convert string long time to ms`, () => {
      assert.equal(convertTimeToString(540620000), "150:10:20");
    });
    test(`Should return 0 time ms`, () => {
      assert.equal(convertTimeToString(0), "00:00:00");
    });
    test(`Should not convert negative time`, () => {
      assert.throws(() => {
        convertTimeToString(-1000);
      });
    });
  });
});
