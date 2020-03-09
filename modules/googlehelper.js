const Q = require("q");
const GoogleApis = require("googleapis");
const Util = require("./util.js");

function generateAuthUrlConsole(in_oAuth2Client){
	const authUrl = in_oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: [
			'https://www.googleapis.com/auth/spreadsheets.readonly',
			'https://www.googleapis.com/auth/drive.readonly',
			'https://www.googleapis.com/auth/drive.metadata.readonly'
			]
		});
	console.log('Get credentials string by visiting this url:', authUrl);
}

//Util.readFilePromise
//https://developers.google.com/drive/api/v3/quickstart/nodejs
module.exports.createOAutho2ClientPromise = function(in_pathClientSecretJson, in_pathCredentialsText){
	var credentials = undefined;
	var oAuth2Client = undefined;
	return Q(true).then(function(){
		return Util.readFilePromise(in_pathClientSecretJson);
	}).then(function(in_content){
		const clientSecret = JSON.parse(in_content);
		oAuth2Client = new GoogleApis.google.auth.OAuth2(
			clientSecret.installed.client_id,
			clientSecret.installed.client_secret,
			clientSecret.installed.redirect_uris[0]);
		return;
	}).then(function(){
		if (undefined !== in_pathCredentialsText) {
			return Util.readFilePromise(in_pathCredentialsText);
		}
		generateAuthUrlConsole(oAuth2Client);
		return;
	}, function(in_error){
		console.log('error:', in_error);
		generateAuthUrlConsole(oAuth2Client);
		return;
	}).then(function(in_credentialsString){
		return dealAuth2ClientCredentials(in_credentialsString, oAuth2Client);
	});
}

function dealAuth2ClientCredentials(in_credentialsString, in_oAuth2Client){
	if (undefined === in_credentialsString){
		return undefined;
	}
	return Q(true).then(function(){
		return in_oAuth2Client.getToken(in_credentialsString)
	}).then(function(in_credentials){
		oAuth2Client.setCredentials(in_credentials);
		return oAuth2Client;
	});
}

/*
const drive = GoogleApis.google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }

 */
module.exports.getFolderMetaDataByName = function(in_folderName, in_dataCache, in_authorization){
	const in_folderMetaDataMap = in_dataCache.m_folderMetaDataMap;
	console.log("getFolderMetaDataByName:" + in_folderName);
	var deferred = Q.defer();
	if (in_folderName in in_folderMetaDataMap){
		//console.log("gFolderMetaDataMap found in_folderName:" + in_folderName);
		deferred.resolve(in_folderMetaDataMap[in_folderName]);
	} else {

		const drive = GoogleApis.google.drive({
			version: "v3",
			auth: in_authorization
			});
		var name = encodeURI(in_folderName, "UTF-8");
		drive.files.list({
			fields: "files(id, name, mimeType)",
			q: "mimeType 'applicatio/vnd.google-apps.folder' and name '" + name + "'"
		}).then(
		//files?q=mimeType%3D'application%2Fvnd.google-apps.folder'+and+name%3D'" + name + "'&fields=files(id%2CmimeType%2Cname)",
		//var name = encodeURI(in_folderName, "UTF-8");
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
					arrayPromice.push(getMetaData(data.files[index].id, in_dataCache, in_authorization));
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

const getMetaData = function(in_id, in_dataCache, in_authorization){
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

const getChildrenOfFolder = function(in_folderID, in_dataCache, in_authorization){
	const in_childrenOfFolderDataMap = in_dataCache.m_childrenOfFolderDataMap;
	//console.log("getChildrenOfFolder:" + in_folderID);
	var deferred = Q.defer();
	if (in_folderID in in_childrenOfFolderDataMap){
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
			console.log("getChildrenOfFolder in_folderID:" + in_folderID + " body:" + body);
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
					arrayPromice.push(getMetaData(data.files[index].id, in_dataCache, in_authorization));
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
module.exports.getSpreadsheetWorksheet = function(in_spreadsheetID, in_worksheetName, in_dataCache, in_authorization){
	const in_spreadsheetWorksheetDataMap = in_dataCache.m_spreadsheetWorksheetDataMap;
	//console.log("getSpreadsheetWorksheet spreadsheet:" + in_spreadsheetID + " worksheet:" + in_worksheetName);
	const key = in_spreadsheetID + "_" + in_worksheetName;
	var deferred = Q.defer();

	if (key in in_spreadsheetWorksheetDataMap){
		//console.log("gSpreadsheetWorksheetDataMap found key:" + key);
		deferred.resolve(in_spreadsheetWorksheetDataMap[key]);
	} else {
		const sheets = google.sheets({version: 'v4', auth});
		sheets.spreadsheets.values.get({
			spreadsheetId: in_spreadsheetID,
			range: in_worksheetName
		}, (error, res) => {
			if (error != null){
				deferred.reject("problem finding SpreadsheetWorksheet:" + in_spreadsheetID + " worksheetName:" + in_worksheetName + " error:" +  error);
				return;
			}
			var value = res.data.values;
			in_spreadsheetWorksheetDataMap[key] = value;
			deferred.resolve(value);
			return;
		});
	return deferred.promise;
}
