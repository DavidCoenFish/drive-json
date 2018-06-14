const TypeEnum = Object.freeze({
	"member":0,
	"array":1
	//"array_auto":2 //nope, wont work, data design is reentrant
});

/*
in_dataSet is object (queried with the "in" keyword) a set of keywords
 */
const Cursor = function(in_dataSet){
	this.m_stack = [];
	this.m_dataset = in_dataSet;
	return;
}

Cursor.prototype.toString = function(){
	return "{\"m_stack\":" + JSON.stringify(this.m_stack) + "}";
}

Cursor.prototype.Clear = function(){
	this.m_stack = [];
	return;
}

Cursor.prototype.PushMember = function(memberName){
	this.m_stack.push({"type": TypeEnum.member, "data": memberName});
	return;
}

Cursor.prototype.PushArray = function(index){
	this.m_stack.push({"type": TypeEnum.array, "data": index});
	return;
}

Cursor.prototype.TestDataset = function(in_arrayDataSet){
	var found = false;
	//var empty = true;

	if (true === Array.isArray(in_arrayDataSet)){
		for (var index = 0, length = in_arrayDataSet.length; index < length; index++) {
			var item = in_arrayDataSet[index];
			if (item in this.m_dataset){
				found = true;
				break;
			}
		}
	}
	
	return found;
	//return (found || empty);
}

Cursor.prototype.Clone = function(){
	var result = new Cursor(this.m_dataset);
	for (var index = 0, total = this.m_stack.length; index < total; index++) {
		var item = this.m_stack[index];
		switch (item.type){
		case TypeEnum.member:
			result.PushMember(item.data);
			break;
		case TypeEnum.array:
			result.PushArray(item.data);
			break;
		default:
			break;
		}
	}
	return result;
}

const MakePath = function(stack, index, value, parentTrace){
	if (index < stack.length){
		var item = stack[index];

		switch (item.type){
		case TypeEnum.member:
			var trace = undefined;
			if (parentTrace === undefined){
				parentTrace = {};
			}
			if (item.data in parentTrace){
				trace = parentTrace[item.data];
			}
			parentTrace[item.data] = MakePath(stack, index + 1, value, trace);
			return parentTrace;
		case TypeEnum.array:
			var trace = undefined;
			if (parentTrace === undefined){
				parentTrace = [];
			}
			parentTrace.length = Math.max(parentTrace.length, item.data + 1);
			var trace = parentTrace[item.data];
			parentTrace[item.data] = MakePath(stack, index + 1, value, trace);
			return parentTrace;
		default:
			throw new Error("MakePath, got:", item.type);
		}
	} else {
		return value;
	}
}

Cursor.prototype.SetValue = function(value, baseObjectOrUndefined){
	//console.log("SetValue:value:" + value + " stack:" + JSON.stringify(this.m_stack));
	if (0 < this.m_stack.length){
		var item = this.m_stack[0];
		switch (item.type){
		case TypeEnum.member:
			var baseObject = (baseObjectOrUndefined === undefined) ? {} : baseObjectOrUndefined;
			var trace = undefined;
			if (item.data in baseObject){
				trace = baseObject[item.data];
			}
			baseObject[item.data] = MakePath(this.m_stack, 1, value, trace);
			break;
		case TypeEnum.array:
			var baseObject = (baseObjectOrUndefined === undefined) ? [] : baseObjectOrUndefined;
			var trace = undefined;
			baseObject.length = Math.max(baseObject.length, item.data + 1);
			if (item.data < baseObject.length){
				trace = baseObject[item.data];
			}
			baseObject[item.data] = MakePath(this.m_stack, 1, value, trace);
		default:
			throw new Error("Cursor SetValue, got:" + item.type + " value:" + value + " stack:" + JSON.stringify(this.m_stack));
		}
	} else {
		throw new Error("Cursor SetValue, no contents:", JSON.stringify(this.m_stack));
	}

	return baseObject;
}

const GetArrayLengthPath = function(stack, index, parentTrace){
	if (parentTrace === undefined){
		return 0;
	}
	if (index === stack.length){
		return parentTrace.length;
	}
	var item = stack[index];

	switch (item.type){
	case TypeEnum.member:
		if (item.data in parentTrace){
			var trace = parentTrace[item.data];
			return GetArrayLengthPath(stack, index + 1, trace);
		}
		break;
	case TypeEnum.array:
		if (item.data < parentTrace.length){
			var trace = parentTrace[item.data];
			return GetArrayLengthPath(stack, index + 1, trace);
		}
		break;
	default:
		throw new Error("GetArrayLengthPath, got:", item.type);
	}

	return 0;
}


Cursor.prototype.GetArrayLength = function(baseObjectOrUndefined){
	if (baseObjectOrUndefined === undefined){
		return 0;
	}
	baseObject = baseObjectOrUndefined;
	if (0 < this.m_stack.length){
		var item = this.m_stack[0];
		switch (item.type){
		case TypeEnum.member:
			var trace = undefined;
			if (item.data in baseObject){
				trace = baseObject[item.data];
				return GetArrayLengthPath(this.m_stack, 1, trace);
			}
			break;
		case TypeEnum.array:
			var trace = undefined;
			if (item.data < baseObject.length){
				trace = baseObject[item.data];
				return GetArrayLengthPath(this.m_stack, 1, trace);
			}
			break;
		default:
			throw new Error("Cursor GetArrayLength got:", item.type);
		}
	} else {
		throw new Error("Cursor GetArrayLength, no contents:", JSON.stringify(this.m_stack));
	}

	return 0;
}


module.exports = function(in_dataSet){
	return new Cursor(in_dataSet);
}


