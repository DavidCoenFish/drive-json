const Q = require("q");
const Cursor = require("./cursor.js");
const SheetToObject = require("./sheettoobject.js");

const driveToObject = function(in_dataServer, in_dirName, in_cursor, in_baseObject){
	//console.log("driveToObject in_dirName:" + in_dirName);

	return in_dataServer.getFolderMetaDataByName(in_dirName).then(function(input){
		return driveFolderToObject(in_dataServer, input.id, in_cursor, in_baseObject);
	});
}
module.exports.driveToObject = driveToObject;


const driveToObjectAddNameCursor = function(in_dataServer, in_name, in_folderId, in_cursor, in_baseObject){
	var localCursor = in_cursor.Clone();
	localCursor.PushMember(in_name); 
	return driveFolderToObject(in_dataServer, in_folderId, localCursor, in_baseObject);
}
module.exports.driveToObjectAddNameCursor = driveToObjectAddNameCursor;
