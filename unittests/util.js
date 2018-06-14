const Q = require('q');
const Test = require("./../modules/test.js");
const Util = require("./../modules/util.js");

module.exports = function(promiseArray) {
	RunCopy(promiseArray);
	return;
}

const RunCopy = function (promiseArray) {
	promiseArray.push(Q(Util.writeFilePromise("./output/unittest_util.txt", "bar")).then(function (input) {
		return Util.movePromise("./output/unittest_util.txt", "./output/unittest_util.txt");
	}));
}
