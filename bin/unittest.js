const Q = require('q');

var promiseArray = [];
require("./../unittests/cursor.js")(promiseArray);
require("./../unittests/drivecursor.js")(promiseArray);
require("./../unittests/sheettoobject.js")(promiseArray);
require("./../unittests/util.js")(promiseArray);

console.log((new Date()).toLocaleString());

Q.allSettled(promiseArray).then(function(input){
	//console.log("main allSettled:" + JSON.stringify(input));
	var exitCode = 0;
	var passCount = 0;
	for(var index = 0; index < input.length; ++index){
		var item = input[index];
		if (item.state === "rejected"){
			exitCode = 1; //error
			console.log("FAILED:" + item.reason);
		} else if (item.state === "fulfilled"){
			passCount += 1;
		}
	}
	if (0 == exitCode){
		console.log("PASSED ALL:" + input.length);
	} else {
		console.log("PASSED " + passCount + "/" + input.length);
	}

	//throw "fail on throw in main";

	return exitCode;
},function(error){
	console.log("main errorA:" + error);
	process.exit(1); //error
}).fail(function(error){
	console.log("main errorB:" + error);
	process.exit(1); //error
}).done(function(input){
	process.exit(input);
});



