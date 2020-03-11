const Q = require("q");
const DriveJson = require("./../index.js");

console.log("start");


function formatDate() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1; // months are zero indexed
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();

	if (month < 10){
		month = "0" + month;
	}

	if (day < 10){
		day = "0" + day;
	}

	if (hour < 10){
		hour = "0" + hour;
	}
	if (minute < 10){
		minute = "0" + minute;
	}
	if (second < 10){
		second = "0" + second;
	}

	return "" + year + month + day + hour + minute + second;
}

var dataServer = undefined
var baseObject = {}
//make the gamedata.json
Q(DriveJson.DataServer.factoryPromise()).then(function(in_dataServer){
	dataServer = in_dataServer;
	var baseDriveCursor = DriveJson.DriveCursor.factory(in_dataServer);
	return DriveJson.DriveCursor.factoryResolvePromice(baseDriveCursor, "callofteabagnight/data:toc")
}).then(function(in_driveCursor){
	var cursor = DriveJson.Cursor();
	return DriveJson.SheetToObject.sheet5thToObject(dataServer, in_driveCursor, cursor, baseObject);
}).then(function(){
	var version = "";
	if ("version" in baseObject)
	{
		version = baseObject["version"];
	}
	version += "." + formatDate();

	baseObject["version"] = version;

	return DriveJson.Util.writeFilePromise("output/gamedata.json", JSON.stringify(baseObject, null, '\t'));
}).fail(function(error){
	console.log("error:" + error);
	process.exit(1); //error
}).done(function(){
	console.log("done");
	process.exit(0);
});

//make a locale.json for each locale found in 

