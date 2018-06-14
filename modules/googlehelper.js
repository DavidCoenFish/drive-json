const Q = require('q');
const RequestWithJWT = require("google-oauth-jwt").requestWithJWT();

/*
	email: '27285370587-compute@developer.gserviceaccount.com',
	keyFile: './data/key.pem',
 */
module.exports.getFolderMetaDataByName = function(in_folderName, in_dataCache, in_email, in_keyFile){
	const in_folderMetaDataMap = in_dataCache.m_folderMetaDataMap;
	//console.log("getFolderMetaDataByName:" + in_folderName);
	var deferred = Q.defer();
	if (in_folderName in in_folderMetaDataMap){
		//console.log("gFolderMetaDataMap found in_folderName:" + in_folderName);
		deferred.resolve(in_folderMetaDataMap[in_folderName]);
	} else {
		var name = encodeURI(in_folderName, "UTF-8");
		RequestWithJWT({
			url: "https://www.googleapis.com/drive/v3/files?q=mimeType%3D'application%2Fvnd.google-apps.folder'+and+name%3D'" + name + "'&fields=files(id%2CmimeType%2Cname)",
			jwt: {
				email: in_email,
				keyFile: in_keyFile,
				scopes: ['https://www.googleapis.com/auth/drive.readonly']
			}
		}, function (error, response, body) {
			if (error != null){
				deferred.reject("problem finding ID of folder:" + in_folderName + " error:" +  error);
				return;
			}
			if (200 != response.statusCode){
				deferred.reject("problem finding ID of folder:" + in_folderName + " statusCode:" +  response.statusCode);
				return;
			}
			try {
				//console.log(" body:" + body);
				var data = JSON.parse(body);
				if (data.files.length <= 0){
					in_folderMetaDataMap[in_folderName] = null;
					deferred.resolve(null);
				}

				//deferred.resolve(data.files[0]);

				var fileIdToReturn = data.files[0];

				var arrayPromice = [];
				for (var index = 0; index < data.files.length; ++index){
					arrayPromice.push(getMetaData(data.files[index].id, in_dataCache));
				}

				Q.allSettled(arrayPromice).then(function(input){ 
					var result;
					input.forEach(function (item) {
						//console.log(" item:" + JSON.stringify(item));
						if (item.state !== "fulfilled") {
							console.log(item.reason);
						} else {
							if (false === ("parents" in item.value)){
								//console.log("found one:" + JSON.stringify(item.value));
								fileIdToReturn = item.value;
							}
						}
					});
					return fileIdToReturn; 
				}).then(function(input){
					//console.log("getFolderMetaDataByName input:" + JSON.stringify(input));
					in_folderMetaDataMap[in_folderName] = input;
					deferred.resolve(input);
				}).done();


			} catch(err) {
				deferred.reject("problem finding ID of folder:" + in_folderName + " error:" +  err.message);
			}
		});
	}

	return deferred.promise;
}

const getMetaData = function(in_id, in_dataCache, in_email, in_keyFile){
	const in_metaDataDataMap = in_dataCache.m_metaDataDataMap;
	//console.log("getMetaData:" + in_id);
	var deferred = Q.defer();
	if (in_id in in_metaDataDataMap){
		//console.log("gMetaDataDataMap found in_id:" + in_id);
		deferred.resolve(in_metaDataDataMap[in_id]);
	} else {
		RequestWithJWT({
			url: "https://www.googleapis.com/drive/v3/files/" + in_id + "?fields=id%2CmimeType%2Cname%2Cparents",
			jwt: {
				email: in_email,
				keyFile: in_keyFile,
				scopes: ['https://www.googleapis.com/auth/drive.readonly']
			}
		}, function (error, response, body) {
			if (error != null){
				deferred.reject("problem finding metadata for file:" + in_id + " error:" +  error);
				return;
			}
			if (200 != response.statusCode){
				deferred.reject("problem finding metadata for file:" + in_id + " statusCode:" +  response.statusCode);
				return;
			}
			try {
				//console.log("body:" + body);

				var data = JSON.parse(body);
				in_metaDataDataMap[in_id] = data;
				deferred.resolve(data);
			} catch(err) {
				deferred.reject("problem finding metadata for file:" + in_id + " error:" +  err.message);
			}
		});
	}

	return deferred.promise;
}
module.exports.getMetaData = getMetaData;

module.exports.getChildMetaDataByName = function(in_folderID, in_childName, in_dataCache){
	return getChildrenOfFolder(in_folderID, in_dataCache).then(function(input){
		for (var index = 0, length = input.length; index < length; index++) {
			var metadata = input[index];
			if (in_childName == metadata.name){
				return metadata;
			}
		}
		return undefined;
	});
}

const gChildrenOfFolderDataMap = {};
const getChildrenOfFolder = function(in_folderID, in_dataCache, in_email, in_keyFile){
	const in_childrenOfFolderDataMap = in_dataCache.m_childrenOfFolderDataMap;
	//console.log("getChildrenOfFolder:" + in_folderID);
	var deferred = Q.defer();
	if (in_folderID in in_childrenOfFolderDataMap){
		//console.log("gChildrenOfFolderDataMap found in_folderID:" + in_folderID);
		deferred.resolve(in_childrenOfFolderDataMap[in_folderID]);
	} else {
		RequestWithJWT({
			url: "https://www.googleapis.com/drive/v3/files?q='" + in_folderID + "'+in+parents&fields=files%2Fid",
			jwt: {
				email: in_email,
				keyFile: in_keyFile,
				scopes: ['https://www.googleapis.com/auth/drive.readonly']
			}
		}, function (error, response, body) {
			if (error != null){
				deferred.reject("problem finding children of folder:" + in_folderID + " error:" +  error);
				return;
			}
			if (200 != response.statusCode){
				deferred.reject("problem finding children of folder:" + in_folderID + " statusCode:" +  response.statusCode);
				return;
			}
			//console.log(" body:" + body);
			var data = JSON.parse(body);
			try {
				var arrayPromice = [];
				for (var index = 0; index < data.files.length; ++index){
					arrayPromice.push(getMetaData(data.files[index].id, in_dataCache));
				}

				Q.allSettled(arrayPromice).then(function(input){ 
					var result = [];
					input.forEach(function (item) {
						if (item.state !== "fulfilled") {
							console.log(item.reason);
						} else {
							result.push(item.value);
						}
					});
					return result; 
				}).then(function(input){
					//console.log("polo input:" + JSON.stringify(input));
					in_childrenOfFolderDataMap[in_folderID] = input;
					deferred.resolve(input);
				}).done();
			} catch(err) {
				deferred.reject("problem finding children of folder:" + in_folderID + " error:" +  err.message);
			}
		});
	}

	return deferred.promise;
}
module.exports.getChildrenOfFolder = getChildrenOfFolder;

/*
https://developers.google.com/apis-explorer/#p/sheets/v4/sheets.spreadsheets.values.get?spreadsheetId=1WX1-l_9jh3JddGzRuxUSC_zU0NirbyJk-tJyugbJagI&range=character_rules&fields=values&_h=2&
*/
module.exports.getSpreadsheetWorksheet = function(in_spreadsheetID, in_worksheetName, in_dataCache, in_email, in_keyFile){
	const in_spreadsheetWorksheetDataMap = in_dataCache.m_spreadsheetWorksheetDataMap;
	//console.log("getSpreadsheetWorksheet spreadsheet:" + in_spreadsheetID + " worksheet:" + in_worksheetName);
	const key = in_spreadsheetID + "_" + in_worksheetName;
	var deferred = Q.defer();

	if (key in in_spreadsheetWorksheetDataMap){
		//console.log("gSpreadsheetWorksheetDataMap found key:" + key);
		deferred.resolve(in_spreadsheetWorksheetDataMap[key]);
	} else {
		var name = encodeURI(in_worksheetName, "UTF-8");
		RequestWithJWT({
			//url: "https://sheets.googleapis.com/v4/spreadsheets/" + in_spreadsheetID + "?includeGridData=true&ranges=" + name + "&fields=sheets(data%2FrowData%2Fvalues%2FeffectiveValue)",
			url: "https://sheets.googleapis.com/v4/spreadsheets/" + in_spreadsheetID + "/values/" + name + "?fields=values",
			jwt: {
				email: in_email,
				keyFile: in_keyFile,
				scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
			}
		}, function (error, response, body) {
			if (error != null){
				deferred.reject("problem finding SpreadsheetWorksheet:" + in_spreadsheetID + " worksheetName:" + in_worksheetName + " error:" +  error);
				return;
			}
			if (200 != response.statusCode){
				deferred.reject("problem finding SpreadsheetWorksheet:" + in_spreadsheetID + " worksheetName:" + in_worksheetName + " statusCode:" +  response.statusCode);
				return;
			}
			//console.log(body);
			var data = JSON.parse(body);
			try {
				in_spreadsheetWorksheetDataMap[key] = data.values;
				deferred.resolve(data.values);
			} catch(err) {
				deferred.reject("problem getting spreadsheet:" + in_spreadsheetID + " worksheet:" + in_worksheetName + " error:" +  err.message);
			}

		});
	}

	return deferred.promise;
}
