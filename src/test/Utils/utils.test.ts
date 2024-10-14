import * as assert from "assert";
import { convertStringToTime, convertTimeToString } from "../../static/Utils";

suite('Utils Test', () => {
	const timeS = "20:00:00";
	const timeN = 72000000;
	
	test("Conversion from number", ()=>{
		assert.strictEqual(convertTimeToString(timeN),timeS);
	});
	test("Conversion from string", ()=>{
		assert.strictEqual(convertStringToTime(timeS),timeN);
	});
});