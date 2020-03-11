const Q = require("q");
const DriveJson = require("./../index.js");

console.log("start");

var dataServer = undefined;
var makeLocale = function(in_key, in_driveCursor, in_promice){
	var dataset = {};
	dataset[in_key] = 0;
	var cursor = DriveJson.Cursor(dataset);
	var localeObject = {};
	return in_promice.then(function(){
		return DriveJson.SheetToObject.sheet5thToObject(dataServer, in_driveCursor, cursor, localeObject);
	}).then(function(){
		return DriveJson.Util.writeFilePromise("output/locale/" + in_key + ".json", JSON.stringify(localeObject, null, '\t'));
	});
}

var setObject = {}
//make the gamedata.json
Q(DriveJson.DataServer.factoryPromise()).then(function(in_dataServer){
	dataServer = in_dataServer;
	var baseDriveCursor = DriveJson.DriveCursor.factory(dataServer);
	return DriveJson.DriveCursor.factoryResolvePromice(baseDriveCursor, "callofteabagnight/locale:set")
}).then(function(in_driveCursor){
	var cursor = DriveJson.Cursor();
	return DriveJson.SheetToObject.sheet5thToObject(dataServer, in_driveCursor, cursor, setObject);
}).then(function(){
	var baseDriveCursor = DriveJson.DriveCursor.factory(dataServer);
	return DriveJson.DriveCursor.factoryResolvePromice(baseDriveCursor, "callofteabagnight/locale:toc")
}).then(function(in_driveCursor){
	//console.log("setObject:" + JSON.stringify(setObject));
	var promice = Q(true);
	for (var key in setObject) {
		promice = makeLocale(key, in_driveCursor, promice);
	}
	return promice;
}).fail(function(error){
	console.log("error:" + error);
	process.exit(1); //error
}).done(function(){
	console.log("done");
	process.exit(0);
});

//make a locale.json for each locale found in 

