const Q = require('q');
const GoogleHelper = require("./googlehelper.js");

const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';


module.exports.factoryPromise = function(){
	var dataServer = undefined;
	return GoogleHelper.createOAutho2ClientPromise(
		TOKEN_PATH, 
		CREDENTIALS_PATH
	).then(function(in_autho){
		dataServer = new DataServer(in_autho);
		return GoogleHelper.getFileList(dataServer, in_autho);
	}).then(function(in_autho){
		return dataServer;
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
	this.m_folderMetaDataMap = {}; //name to metadata (folders only)
	this.m_metaDataDataMap = {}; //id to metadata (files and folders)
	this.m_spreadsheetWorksheetDataMap = {}; //id to sheet data
	this.m_test = 0;
	this.m_authorization = in_authorization;
	this.m_rootId = undefined;
	this.m_rootName = undefined
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
	return this.m_rootName;
}

DataServer.prototype.getRootId = function() {
	return this.m_rootId;
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
	for (var key in this.m_folderMetaDataMap) {
		var metaData = this.m_folderMetaDataMap[key];
		if (in_name == metaData.name){
			return metaData;
		}
	}
	return undefined;
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
	if (in_id in this.m_metaDataDataMap){
		return this.m_metaDataDataMap[in_id];
	}
	return undefined;
};

DataServer.prototype.getFolderChildrenMetaDataArray = function(in_id){
	var metaDataArray = [];
	if (in_id in this.m_folderMetaDataMap){
		var childrenArray = this.m_folderMetaDataMap[in_id].children;
		if (null != childrenArray){ 
			for (var index = 0, length = childrenArray.length; index < length; index++) {
				var id = childrenArray[index];
				if (id in this.m_metaDataDataMap){
					metaDataArray.push(this.m_metaDataDataMap[id]);
				}
			}
		}
	}
	return Q(metaDataArray);
};

DataServer.prototype.getSpreadsheetWorksheetData = function(in_id, in_worksheetName){
	var that = this;
	return Q.delay(100).then(function(){
		return GoogleHelper.getSpreadsheetWorksheet(in_id, in_worksheetName, that, that.m_authorization);
	});
};
