
const Q = require("q");
const FileSystem = require("fs");
const Path = require("path");

module.exports.writeFilePromise = function(in_filePath, in_data){
	var deferred = Q.defer();

	var dirPath = Path.dirname(in_filePath);
	 try {
		FileSystem.mkdirSync(dirPath)
	} catch (err) {
		if (err.code !== 'EEXIST') throw err
	}

	try {
		FileSystem.writeFile(in_filePath, in_data, function(error) {
			if(error) {
				deferred.reject("writeFilePromise:" + in_filePath + " error:" +  error);
				return;
			}
			deferred.resolve(true);
		}); 
	} catch (error) {
		deferred.reject(error);
	}
	return deferred.promise;
}

module.exports.readFilePromise = function(in_filePath){
	var deferred = Q.defer();
	FileSystem.readFile(in_filePath, 'utf8', function(error, data){
		if (error){
			deferred.reject("readFilePromise:" + in_filePath + " error:" +  error);
			return;
		}
		deferred.resolve(data);
	});
	return deferred.promise;
}

const movePromise = function(in_oldPath, in_newPath){
	var deferred = Q.defer();

	FileSystem.rename(in_oldPath, in_newPath, function (error) {
		if (error) {
			if (error.code === 'EXDEV') {
				deferred.resolve(copyPromise(in_oldPath, in_newPath));
			} else {
				deferred.reject(JSON.stringify(error));
			}
			return;
		}
		deferred.resolve(null);
	});

	return deferred.promise;
}
module.exports.movePromise = movePromise;

const copyPromise = function(in_oldPath, in_newPath) {
	var deferred = Q.defer();

	var readStream = FileSystem.createReadStream(in_oldPath);
	var writeStream = FileSystem.createWriteStream(in_newPath);

	readStream.on('error', function (error) {
		deferred.reject(JSON.stringify(error));
	});
	writeStream.on('error', function (error) {
		deferred.reject(JSON.stringify(error));
	});

	readStream.on('close', function () {
		FileSystem.unlink(in_oldPath, function () {
			deferred.resolve(null);
		});
	});

	readStream.pipe(writeStream);

	return deferred.promise;
}
module.exports.copyPromise = copyPromise;
