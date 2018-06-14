const Q = require('q');
const Cursor = require("./../modules/cursor.js");
const Test = require("./../modules/test.js");

module.exports = function(promiseArray) {
	RunEmpty(promiseArray);
	RunSimple(promiseArray);
	Run(promiseArray);
	RunObject(promiseArray);
	RunObjectCursor(promiseArray);

	return;
}

const RunEmpty = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var cursor = Cursor();
		return true;
	}));
}

const RunSimple = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var cursor = Cursor();
		cursor.PushMember("a");
		cursor.PushArray(2);
		cursor.PushArray(0);
		cursor.PushMember("b");

		var baseObject = cursor.SetValue("c");
		var expected = {"a":[null, null, [{"b" : "c"}]]};

		Test.DealTest("RunSimple", JSON.stringify(baseObject), JSON.stringify(expected));

		//console.log(JSON.stringify(baseObject));

		return true;
	}));
}

const Run = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var cursor = Cursor();
		cursor.PushMember("a");
		cursor.PushArray(2);
		cursor.PushArray(0);
		var cursor2 = cursor.Clone();
		cursor.PushMember("b");
		var baseObject = cursor.SetValue("c");

		cursor2.PushMember("d");
		cursor2.PushMember("e");
		baseObject = cursor2.SetValue(0, baseObject);

		var cursor3 = Cursor();
		cursor3.PushMember("a");
		cursor3.PushArray(3);
		baseObject = cursor3.SetValue("f", baseObject);

		var expected = {"a":[null, null, [{"b" : "c", "d" : {"e":0}}], "f"]};

		Test.DealTest("Run", JSON.stringify(baseObject), JSON.stringify(expected));

		//console.log(JSON.stringify(baseObject));

		return true;
	}));
}

const RunObject = function (promiseArray) {
	promiseArray.push(Q(true).then(function (input) {
		var data = { "empty": {} };

		Test.DealTest("RunObject", JSON.stringify(data), "{\"empty\":{}}");
		
		return true;
	}));
}

const RunObjectCursor = function (promiseArray) {
	promiseArray.push(Q(true).then(function (input) {
		var cursor = Cursor();
		cursor.PushMember("empty");
		var data = {};
		cursor.SetValue({}, data)

		Test.DealTest("RunObjectCursor", JSON.stringify(data), "{\"empty\":{}}");

		return true;
	}));
}

