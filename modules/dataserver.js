const Q = require('q');
const GoogleHelper = require("./googlehelper.js");

const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';


module.exports.factoryPromise = function(){
	return GoogleHelper.createOAutho2ClientPromise(
		TOKEN_PATH, 
		CREDENTIALS_PATH
		).then(function(in_autho){
			return new DataServer(in_autho);
	});
}

const TypeEnum = Object.freeze({
	"unknown":0,
	"folder":1, //"mimeType": "application/vnd.google-apps.folder"
	"spreadsheet":2 //"mimeType": "application/vnd.google-apps.spreadsheet"
	//"doc"?
});
module.exports.TypeEnum = TypeEnum;

const DataServer = function(in_authorization) {
	this.m_folderMetaDataMap = {};
	this.m_metaDataDataMap = {};
	this.m_childrenOfFolderDataMap = {};
	this.m_spreadsheetWorksheetDataMap = {};
	this.m_test = 0;
	this.m_authorization = in_authorization;
}

const getType = function(in_mimeType){
	//var mimeType = in_metaData.mimeType;
	if (in_mimeType === "application/vnd.google-apps.folder"){
		return TypeEnum.folder;
	}
	if (in_mimeType === "application/vnd.google-apps.spreadsheet"){
		return TypeEnum.spreadsheet;
	}
	return TypeEnum.unknown;
}

DataServer.prototype.getRootName = function() {
	//console.warn("DataServer.getRootName is unimplemented");
	return "root";
}

DataServer.prototype.getRootId = function() {
	//console.warn("DataServer.getRootId is unimplemented");
	return "root";
}

DataServer.prototype.getMetaDataByNameArray = function(in_input, in_dirArray) {
	//console.log("getMetaDataByNameArray in_input:" + JSON.stringify(in_input) + " in_dirArray:" + JSON.stringify(in_dirArray));
	if (in_dirArray.length <= 0){
		return in_input;
	}

	var that = this;
	var childName = in_dirArray.shift();
	return Q.delay(100).then(function(){
		return GoogleHelper.getChildMetaDataByName(in_input.id, childName, that, that.m_authorization);
	}).then(function(input){
		return that.getMetaDataByNameArray(input, in_dirArray);
	})
}

/*
returns promise
resolve null if not found
resolve object {
	"name" : name,
	"id" : id,
	"type" : type,
	"mimeType" : mimeType
}
*/
DataServer.prototype.getFolderMetaDataByName = function(in_name) {
	//console.log("getFolderMetaDataByName in_name:" + in_name);
	var dirArray = in_name.split("/");
	//console.log(" dirArray:" + dirArray);
	var rootDir = dirArray.shift();

	var that = this;

	return Q.delay(100).then(function(){
		return GoogleHelper.getFolderMetaDataByName(rootDir, that, that.m_authorization);
	}).then(function(input){
		return that.getMetaDataByNameArray(input, dirArray);
	}).then(function(input){
		if (input != null){
			input.type = getType(input.mimeType);
		}
		//console.log(" input:" + input);
		return input;
	});
};

/*
returns promise
resolve null if not found
resolve object {
	"name" : name,
	"id" : id,
	"type" : type,
	"mimeType" : mimeType
}
*/
DataServer.prototype.getMetaDataByID = function(in_id){
	var that = this;
	return Q.delay(100).then(function(){
		return GoogleHelper.getMetaData(in_id, that, that.m_authorization);
	}).then(function(input){
		if (input != null){
			input.type = getType(input.mimeType);
		}
		return input;
	});
};

DataServer.prototype.getFolderChildrenMetaDataArray = function(in_id){
	var that = this;
	return Q.delay(100).then(function(){
		return GoogleHelper.getChildrenOfFolder(in_id, that, that.m_authorization);
	}).then(function(input){
		for (var index = 0, length = input.length; index < length; index++) {
			var item = input[index];
			if (item != null){
				item.type = getType(item.mimeType);
			}
		}
		return input;
	});
};

DataServer.prototype.getSpreadsheetWorksheetData = function(in_id, in_worksheetName){
	var that = this;
	return Q.delay(100).then(function(){
		return GoogleHelper.getSpreadsheetWorksheet(in_id, in_worksheetName, that, that.m_authorization);
	});
};
