const Q = require("q");
const DriveJson = require("./../index.js");

console.log("start");

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
	return DriveJson.Util.writeFilePromise("gamedata.json", JSON.stringify(baseObject, null, '\t'));
}).fail(function(error){
	console.log("error:" + error);
	process.exit(1); //error
}).done(function(){
	console.log("done");
	process.exit(0);
});

//make a locale.json for each locale found in 

