const Q = require("q");
const GoogleApis = require("googleapis");
const Util = require("./util.js");
const SCOPES = [
			'https://www.googleapis.com/auth/spreadsheets.readonly',
			'https://www.googleapis.com/auth/drive.readonly',
			'https://www.googleapis.com/auth/drive.metadata.readonly'
			];

function generateAuthUrlConsole(in_oAuth2Client){
	const authUrl = in_oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES
		});
	console.log('Get credentials string by visiting this url:', authUrl);
}

const MakeToken = function(in_oAuth2Client, in_pathToken){
	var deferred = Q.defer();
	const authUrl = in_oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		in_oAuth2Client.getToken(code, (error, token) => {
			if (error){
				deferred.reject("Error while trying to retrieve access token error:" +  error);
				return;
			}

			deferred.resolve(Util.writeFilePromise(JSON.stringify(token)));
		});
	});
	return deferred.promise;
}

//Util.readFilePromise
//https://developers.google.com/drive/api/v3/quickstart/nodejs
module.exports.createOAutho2ClientPromise = function(in_pathToken, in_pathCredentialsText){
	var oAuth2Client = undefined;
	return Q(true).then(function(){
		return Util.readFilePromise(in_pathCredentialsText);
	}).then(function(in_credentialsText){
		const credentials = JSON.parse(in_credentialsText);
		oAuth2Client = new GoogleApis.google.auth.OAuth2(
			credentials.installed.client_id,
			credentials.installed.client_secret,
			credentials.installed.redirect_uris[0]);
		return Util.readFilePromise(in_pathToken);
	}).then(function(in_tokenFile){
		oAuth2Client.setCredentials(JSON.parse(in_tokenFile));
		return oAuth2Client;
	}, function(in_error){
		console.log('error:', in_error);
		return MakeToken(oAuth2Client);
	}).then(function(){
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
		}).then(function(in_res){
			console.log("getFolderMetaDataByName:" + JSON.parse(in_res));
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
		const drive = GoogleApis.google.drive({
			version: "v3",
			auth: in_authorization
			});
		var name = encodeURI(in_folderName, "UTF-8");
		//"https://www.googleapis.com/drive/v3/files/" + in_id + "?fields=id%2CmimeType%2Cname%2Cparents",
		//in_metaDataDataMap[in_id] = data;
		//deferred.resolve(data);
		deferred.reject("problem finding metadata for file:" + in_id + " error:" +  err.message);
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
		//url: "https://www.googleapis.com/drive/v3/files?q='" + in_folderID + "'+in+parents&fields=files%2Fid",
		deferred.reject("problem finding children of folder:" + in_folderID + " error:" +  error);
		//in_childrenOfFolderDataMap[in_folderID] = input;
		//deferred.resolve(input);
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
	}
	return deferred.promise;
}
