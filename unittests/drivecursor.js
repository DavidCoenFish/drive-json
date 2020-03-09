const Q = require('q');
const DriveCursor = require("./../modules/drivecursor.js");
const MockDataServer = require("./../modules/mockdataserver.js");
const TypeEnum = require("./../modules/dataserver.js").TypeEnum;
const Test = require("./../modules/test.js");

module.exports = function(promiseArray) {
	RunEmpty(promiseArray);
	RunSimple(promiseArray);

	return;
}

const RunEmpty = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"root" : {
				"metaData" : {
					"name" : "root",
					"id" : "root",
					"root" : true,
					"type" : TypeEnum.folder,
					},
				childrenArray : []
				}
		});

		var driveCursor = DriveCursor.factory(dataServer);
		return true;
	}));
}

const RunSimple = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"root" : {
				"metaData" : {
					"name" : "root",
					"id" : "root",
					"root" : true,
					"type" : TypeEnum.folder,
					},
				childrenArray : ["foldera", "test2"]
				},
			"foldera" : {
				"metaData" : {
					"name" : "foldera",
					"id" : "foldera",
					"type" : TypeEnum.folder,
					},
				childrenArray : ["folderb", "folderc"]
				},
			"folderb" : {
				"metaData" : {
					"name" : "folderb",
					"id" : "folderb",
					"type" : TypeEnum.folder,
					},
				childrenArray : []
				},
			"folderc" : {
				"metaData" : {
					"name" : "folderc",
					"id" : "folderc",
					"type" : TypeEnum.folder,
					},
				childrenArray : []
				},
			"test2":{
				"metaData" : {
					"name" : "test2",
					"id" : "test2",
					"type" : TypeEnum.file,
					},
				childrenArray : []
				}
		});

		const driveCursorBase = DriveCursor.factory(dataServer);
		var driveCursorA = undefined;
		var driveCursorB = undefined;
		var driveCursorC = undefined;

		return Q(true).then(function(in_input){
			return DriveCursor.factoryResolvePromice(driveCursorBase, "/root/foldera/folderb");
		}).then(function(in_input){
			driveCursorA = in_input;
			return DriveCursor.factoryResolvePromice(driveCursorA, "./folderc/test:sheet");
		}).then(function(in_input){
			driveCursorB = in_input;
			return DriveCursor.factoryResolvePromice(driveCursorB, "/root/test2");
		}).then(function(in_input){
			driveCursorC = in_input;

			Test.DealTest("RunSimple0", driveCursorBase.getFullPath(), "");
			Test.DealTest("RunSimple1", driveCursorA.getFullPath(), "/root/foldera/folderb");
			Test.DealTest("RunSimple2", driveCursorB.getFullPath(), "/root/foldera/folderc/test:sheet");
			Test.DealTest("RunSimple3", driveCursorC.getFullPath(), "/root/test2");
		});
	}));
}
