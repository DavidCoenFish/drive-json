/*
a cursor for the current file in the dataServer drive
resoves absolute and relative file paths
/root/foldera/folderb
../folderc
 */

const Q = require('q');

module.exports.factory = function(in_dataServer){
	return new DriveCursor(in_dataServer);
}

//if you start with an empty folder, consider path as absolute
module.exports.factoryResolvePromice = function(in_baseCursor, in_path){
	const deferred = Q.defer();
	const newCursor = in_baseCursor.clone();
	newCursor.pop(); // file leaf not part of path
	const pathTokens = in_path.split("/");
	if ("" === pathTokens[0]){
		pathTokens.shift();
		newCursor.setToRoot();
		var rootName = pathTokens.shift();
		if (rootName !== newCursor.m_nameStack[0]){
			console.warn("DriveCursor.resolve root folder name mismatch:" + rootName + " rootName:" + this.m_nameStack[0]);
			return Q(newCursor);
		}
	}

	var promice = Q(newCursor);
	for (var index = 0, total = pathTokens.length; index < total; index++) {
		var token = pathTokens[index];

		promice = newCursor.pushPromise(token).then(function(){
			return newCursor;
		});
	}

	return promice;
}

const DriveCursor = function(in_dataServer){
	this.m_dataServer = in_dataServer;
	this.m_nameStack = [];
	this.m_idStack = [];
	this.m_worksheet = undefined;
	return;
}

DriveCursor.prototype.toString = function(){
	return "{\"m_nameStack\":" + JSON.stringify(this.m_stack) + ", \"m_idStack\":" + JSON.stringify(this.m_idStack) + ", \"m_worksheet\": \"" + this.m_worksheet + "\" }";
}

DriveCursor.prototype.clear = function(){
	this.m_nameStack = [];
	this.m_idStack = [];
	this.m_worksheet = undefined;
	return;
}

DriveCursor.prototype.getName = function(){
	return this.m_nameStack[this.m_nameStack.length - 1];
}

DriveCursor.prototype.getId = function(){
	return this.m_idStack[this.m_idStack.length - 1];
}

DriveCursor.prototype.getWorksheet = function(){
	return this.m_worksheet;
}

DriveCursor.prototype.getFullPath = function(){
	var result = "";
	for (var index = 0, total = this.m_nameStack.length; index < total; index++) {
		var name = this.m_nameStack[index];
		result += "/" + name;
	}
	if (undefined !== this.m_worksheet){
		result += ":" + this.m_worksheet;
	}
	return result;
}

DriveCursor.prototype.pushPromise = function(in_name){
	if ("." === in_name){
		return Q(this);
	}
	if (".." === in_name){
		this.pop();
		return Q(this);
	}

	//this.m_worksheet
	const splitName = in_name.split(":");
	const name = splitName[0];
	this.m_worksheet = undefined;
	if (1 < splitName.length){
		this.m_worksheet = splitName[1];
	}

	this.m_nameStack.push(name);
	var parentId = (0 < this.m_idStack.length) ? this.m_idStack[this.m_idStack.length - 1] : this.m_dataServer.getRootId();

	const that = this;
	return this.m_dataServer.getFolderChildrenMetaDataArray(parentId).then(function(metaDataArray){
		var id = undefined;
		for (var index = 0, length = metaDataArray.length; index < length; index++) {
			var item = metaDataArray[index];
			if (item.name !== name){
				continue;
			}
			id = item.id;
			break;
		}

		that.m_idStack.push(id);
	});
}

DriveCursor.prototype.pop = function(){
	if (0 < this.m_nameStack.length){
		this.m_nameStack.pop();
		this.m_idStack.pop();
	}
	this.m_worksheet = undefined;
	return;
}

DriveCursor.prototype.clone = function(){
	var result = new DriveCursor(this.m_dataServer);
	for (var index = 0, total = this.m_nameStack.length; index < total; index++) {
		var name = this.m_nameStack[index];
		var id = this.m_idStack[index];
		result.m_nameStack.push(name);
		result.m_idStack.push(id);
	}
	result.m_worksheet = this.m_worksheet;
	return result;
}

DriveCursor.prototype.setToRoot = function(){
	this.clear();
	this.m_nameStack.push("root");
	this.m_idStack.push(this.m_dataServer.getRootId());
	return;
}

