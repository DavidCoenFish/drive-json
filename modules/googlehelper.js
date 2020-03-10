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

			deferred.resolve(Util.writeFilePromise(Jin_pathToken, SON.stringify(token)));
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

const isMimeTypeFolder = function(in_mimeType){
	//var mimeType = in_metaData.mimeType;
	if (in_mimeType === "application/vnd.google-apps.folder"){
		return true;
	}
	return false;
}

/*
[
	{"mimeType": "application/vnd.google-apps.folder","id":"1vyDCCFHque977LWJ07WuhZFdjDAGF7lGNZ5JDUd5D54","name":"data","parents":["1jKX8iT3CAxf8l2kn75Uh9VV8BUoQm6wS"]},
	...
]
	in_dataCache.m_folderMetaDataMap = {}; //name to metadata (folders only)
	in_dataCache.m_metaDataDataMap = {}; //id to metadata (files and folders)
	in_dataCache.m_rootId = undefined;
	in_dataCache.m_rootName = undefined
*/
const DealFiles = function(in_fileArray, in_dataCache){
	for (var index = 0, length = in_fileArray.length; index < length; index++) {
		var item = in_fileArray[index];
		in_dataCache.m_metaDataDataMap[item.id] = item;
		if (true === isMimeTypeFolder(item.mimeType)){
			in_dataCache.m_folderMetaDataMap[item.id] = item;
			item.children = [];
		}
	}

	//guess root
	for (var index = 0, length = in_fileArray.length; index < length; index++) {
		var parentArray = in_fileArray[index].parents;
		if (undefined === parentArray){
			continue;
		}
		for (var subindex = 0, sublength = parentArray.length; subindex < sublength; subindex++) {
			var parent = parentArray[subindex];
			if (false === (parent in in_dataCache.m_metaDataDataMap)){
				in_dataCache.m_rootId = parent;
			}
		}
	}

	var rootMetadata = {
		"id":in_dataCache.m_rootId,
		"name":undefined,
		"children":[]
	};

	if (undefined != in_dataCache.m_rootId){
		in_dataCache.m_metaDataDataMap[in_dataCache.m_rootId] = rootMetadata;
		in_dataCache.m_folderMetaDataMap[in_dataCache.m_rootId] = rootMetadata;
	} else {
		console.log("could not determin root folder");
	}

	// populate child array
	for (var index = 0, length = in_fileArray.length; index < length; index++) {
		var item = in_fileArray[index];
		var parentArray = item.parents;
		if (undefined === parentArray){
			rootMetadata.children.push(item.id);
			continue;
		}
		for (var subindex = 0, sublength = parentArray.length; subindex < sublength; subindex++) {
			var parentID = parentArray[subindex];
			if (parentID in in_dataCache.m_folderMetaDataMap){
				var parent = in_dataCache.m_folderMetaDataMap[parentID];
				parent.children.push(item.id);
			}
		}
	}

	return;
}

/*
const drive = GoogleApis.google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id,name,parents,mimeType)
  }
 */
module.exports.getFileList = function(in_dataCache, in_authorization){
	const drive = GoogleApis.google.drive({
		version: "v3",
		auth: in_authorization
		});
	return drive.files.list({
		auth: in_authorization,
		corpora: "user",
		fields: "files(id,name,parents,mimeType)"
	}).then(function(in_res){
		DealFiles(in_res.data.files, in_dataCache);
	}).then(function(){
		return getNameByID(in_dataCache.m_rootId, in_authorization);
	}).then(function(in_name){
		if (undefined !== in_name){
			in_dataCache.m_folderMetaDataMap[in_dataCache.m_rootId].name = in_name;
			in_dataCache.m_rootName = in_name;
		}
		return;
	});
}

/*
const drive = GoogleApis.google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }
 */
const getNameByID = function(in_id, in_authorization){
	const drive = GoogleApis.google.drive({
		version: "v3",
		auth: in_authorization
		});
	return drive.files.get({
		auth: in_authorization,
		fileId:in_id,
		fields: "name"
	}).then(function(in_res){
		return in_res.data.name;
	});
}

module.exports.getSpreadsheetWorksheet = function(in_spreadsheetID, in_worksheetName, in_dataCache, in_authorization){
	const in_spreadsheetWorksheetDataMap = in_dataCache.m_spreadsheetWorksheetDataMap;
	//console.log("getSpreadsheetWorksheet spreadsheet:" + in_spreadsheetID + " worksheet:" + in_worksheetName);
	const key = in_spreadsheetID + "_" + in_worksheetName;

	if (key in in_spreadsheetWorksheetDataMap){
		//console.log("gSpreadsheetWorksheetDataMap found key:" + key);
		return Q(in_spreadsheetWorksheetDataMap[key]);
	}
	const sheets = GoogleApis.google.sheets({version: 'v4', auth: in_authorization});
	return sheets.spreadsheets.values.get({
		auth: in_authorization,
		spreadsheetId: in_spreadsheetID,
		range: in_worksheetName
	}).then(function(in_result){
		var value = in_result.data.values;
		in_spreadsheetWorksheetDataMap[key] = value;
		return value;
	});
}
