const Q = require('q');
const Test = require("./../modules/test.js");
const Cursor = require("./../modules/cursor.js");
const DriveCursor = require("./../modules/drivecursor.js");
const SheetToObject = require("./../modules/sheettoobject.js");
const MockDataServer = require("./../modules/mockdataserver.js");
const TypeEnum = require("./../modules/dataserver.js").TypeEnum;

module.exports = function(promiseArray) {
	//RunSimpleInt(promiseArray);
	//RunSimpleFloat(promiseArray);
	//RunSimpleBool(promiseArray);
	//RunSimpleString(promiseArray);
	//RunSimpleArray(promiseArray);
	//RunSimpleSheet3rd(promiseArray);
	//RunSimpleSheet5th(promiseArray);
	//RunSimpleSheet3rdKeyValue(promiseArray);
	//RunData(promiseArray);
	//RunSheet3rdToObject(promiseArray);
	RunChildren(promiseArray);

	return;
}

const RunSimpleInt = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"toc" : [
							[ "int:version", 42 ]
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(){
			var expected = {"version" : 42};
			Test.DealTest("RunSimpleInt", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunSimpleFloat = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"toc" : [
							[ "float:value", 2.5 ]
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(){
			var expected = {"value" : 2.5};
			Test.DealTest("RunSimpleFloat", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunSimpleBool = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"toc" : [
							[ "bool:value", null ]
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(){
			var expected = {"value" : false};
			Test.DealTest("RunSimpleBool", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunSimpleString = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"toc" : [
							[ "string:value", "hello" ]
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(){
			var expected = {"value" : "hello"};
			Test.DealTest("RunSimpleString", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunSimpleArray = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"toc" : [
							[ "value:array:int", "1" ],
							[ "value:int:array", "2" ],
							[ "int:value:array", "3" ],
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(input){
			var expected = {"value" : [1,2,3]};
			Test.DealTest("RunSimpleArray", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunSimpleSheet3rd = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"sheeta" : [
							[ "sheet3rd:a", "fileId0:sheetb" ],
							[ "sheet3rd:b", "fileId1:sheeta" ],
						],
					"sheetb" : [
							[ "_id", "string:c", "int:d" ],
							["e", "hello", 5 ],
							["f", "world", 1 ]
						]
					}
				},
			"fileId1" : {
				"data" : {
					"sheeta" : [
							[ "_id", "bool:d"],
							["", false ],
							["c", true ]
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:sheeta");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(input){
			var expected = {"a" : { "e" : {"c":"hello", "d" :5}, "f" : { "c": "world", "d" : 1}}, "b" : { "c" : { "d" : true } }};
			Test.DealTest("RunSimpleSheet3rd", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunSimpleSheet5th = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"sheeta" : [
							[ "sheet5th:a", "fileId0:sheetb" ],
							[ "sheet5th:b", "fileId1:sheeta" ],
						],
					"sheetb" : [
							[ "string:value", "hello" ]
						]
					}
				},
			"fileId1" : {
				"data" : {
					"sheeta" : [
							[ "string:value", "world" ]
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:sheeta");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(input){
			var expected = {"a" : {"value":"hello"}, "b" : { "value": "world"}};
			Test.DealTest("RunSimpleSheet5th", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunSimpleSheet3rdKeyValue = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"toc" : [
							[ "a:b:sheet3rdKeyValue", "fileId1:sheet1" ]
						]
					}
				},
			"fileId1" : {
				"data" : {
					"sheet1" : [
						[ "_id", "dataset:a:string", "dataset:b:string"],
						["a", "aa", "ab"],
						["b", "ba", "bb"],
						["c", "ca", "cb"],
					]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(input){
			var expected = {"a" : { "b" : { "a" : "ab", "b" : "bb", "c" : "cb" } } };
			Test.DealTest("RunSimpleSheet3rdKeyValue", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunData = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"toc" : [
							[ "root:array:1:array:outer:inner:int", "1" ],
							[ "root:array:1:array:foo:bar:int", "2" ],
							[ "root:array:2:array:moo:bool", true ],
							[ "root:array:2:array:goo:bool", false ],
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet5thToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(input){
			var expected = {"root" : [null,[{"outer":{"inner":1}},{"foo":{"bar":2}}],[{"moo":true},{"goo":false}]]};
			Test.DealTest("RunData", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunSheet3rdToObject = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"fileId0" : {
				"data" : {
					"toc" : [
							[ "_id", "a:int", "b:bool"],
							[ "" ],
							[ "foo", "1", "true" ],
							[ "bar", "2", "false" ],
							[ "moo", 3, true ],
							[ "zoo", 4, false ],
						]
					}
				}
			});

		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "fileId0:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet3rdToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(input){
			var expected = {"foo" : { "a":1, "b":true }, "bar" : { "a":2, "b":false }, "moo" : { "a":3, "b":true }, "zoo" : { "a":4, "b":false }};
			Test.DealTest("RunSheet3rdToObject", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

const RunChildren = function(promiseArray) {
	promiseArray.push(Q(true).then(function(input){
		var dataServer = MockDataServer({
			"root" : {
				"metaData" : {
					"name" : "root",
					"id" : "root",
					"root" : true,
					"type" : TypeEnum.folder,
					},
				childrenArray : [ "fileId00", "fileId01", "folderId0" ], //folder children data
				},
			"fileId00" : {
				"metaData" : {
					"id" : "fileId00"
					},
				"data" : {
					"toc" : [
							[ "sheet5th:foo", "./folderId0/fileId1:sheet0" ],
						]
					}
				},
			"folderId0" : {
				"metaData" : {
					"name" : "folderId0",
					"id" : "folderId0",
					"type" : TypeEnum.folder,
					},
				childrenArray : [ "fileId1" ], //folder children data
				},
			"fileId1" : {
				"metaData" : {
					"id" : "fileId1"
					},
				"data" : {
					"sheet0" : [
							[ "a:int", 5]
							[ "sheet5th:bar", "../fileId01:sheet1" ],
						]
					}
				},
			"fileId01" : {
				"metaData" : {
					"id" : "fileId01"
					},
				"data" : {
					"sheet1" : [
							[ "b:int", 7]
						]
					}
				}
			});
		var baseObject = {};
		return Q(true).then(function(){
			return DriveCursor.factoryResolvePromice(DriveCursor.factory(dataServer), "/root/fileId00:toc");
		}).then(function(driveCursor){
			var cursor = Cursor();
			return SheetToObject.sheet3rdToObject(dataServer, driveCursor, cursor, baseObject);
		}).then(function(input){
			var expected = {"foo" : { "a":1, "b":true }, "bar" : { "a":2, "b":false }, "moo" : { "a":3, "b":true }, "zoo" : { "a":4, "b":false }};
			Test.DealTest("RunChildren", JSON.stringify(baseObject), JSON.stringify(expected));
			return true;
		});
	}));
}

//