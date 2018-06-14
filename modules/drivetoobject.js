const Q = require("q");
const Cursor = require("./cursor.js");
const SheetToObject = require("./sheettoobject.js");

const driveFolderToObject = function(in_dataServer, in_folderId, in_cursor, in_baseObject){
	//console.log("driveFolderToObject in_folderId:" + in_folderId);
	return in_dataServer.getFolderChildrenMetaDataArray(in_folderId).then(function(input){
		var arrayPromice = [];
		for (var index = 0, length = input.length; index < length; index++) {
			var metaData = input[index];

			if (metaData.type == in_dataServer.TypeEnum.folder) {
				//was driveToObjectAddNameCursor
				arrayPromice.push(driveToObject(in_dataServer, metaData.name, metaData.id, in_cursor, in_baseObject));
			} else if (metaData.type == in_dataServer.TypeEnum.spreadsheet) {
				arrayPromice.push(SheetToObject.sheetToObject(in_dataServer, metaData.id, in_cursor, in_baseObject, metaData.name));
			} else {
				console.log("Don't know how to deal with file type:" + metaData.mimeType);
			}
		}

		return Q.allSettled(arrayPromice).then(function(input){ 
			input.forEach(function (result) {
				if (result.state !== "fulfilled") {
					console.log(result.reason);
					throw result.reason;
				}
			});
			return in_baseObject; 
		});
	});
}

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
