drive-json(1) -- convert google drive data to json
===========================================

## Install

```bash
npm install --save drive-json
````

## Usage

As a node module:

```js
const VersionHelper = require('drive-json')

```

As a command-line utility:

```
$ drive-json -h

convert data from google drive into json data. connection authority uses google-oauth-jwt
usage:
    drive-json [options]

sample:
    drive-json --email foo@developer.gserviceaccount.com --keyfile ./data/key.pem --sheet3rd /proj01/dev/sheetA:worksheetA --outjson ./output/foo.json
        using given email and keyfile, add the data from the google drive spreadsheet at the given location in 3rd normalised form, and save result data as json

options:
-h --help -?
    generate this text
-e --email <email>
    set the email for connection authority
-k --keyfile <filepath of key.pem>
    set the file path to the key permission file
-s --dataSet <lable>
    add lable to the allowed dataSet for filtering sheet3rdKeyValue sheets
-3 --sheet3rd <drive relative path to sheet : worksheet>
    append the result data with data sourced from google spread sheet worksheet in 3rd normalised form and trated as id : object
-5 --sheet5th <drive relative path to sheet : worksheet>
    append the result data with data sourced from google spread sheet worksheet in 5th normalised form and treated as key : value
-v --sheet3rdKeyValue <drive relative path to sheet : worksheet>
    append the result data with data sourced from google spread sheet worksheet in 3rd normalised form filtered by dataset and treated as key : value
-o --outjson <output json filepath>
    specify the file location to save a json  representation of the result data

```

## Google drive access

## Spreadsheet data conventions
markup key cells contain non empty string of tokens, names, dataset, all seperated by ":". for example "keynameA:string", "notes:ignore", "dataset:a:string", "keyname:array:int" (key name must be before the "array" token) 

### markup tokens
- ignore
- int
- float
- bool
- string
- sheet3rd
- sheet5th
- sheet3rdKeyValue
- array
- dataset:xxx

### 3rd normailized
```
"_id", keyA, keyB
id0, value0A, value0B
id1, value1A, value1B
=> { id0 : { keyA : value0A, keyB : value0B }, id1 : { keyA : value1A, keyB : value1B } }
```

### 5th normailized
```
key0, value0
key1, value1
=> { key0 : value0, key1 : value1 }
```

### 3rd normailized key value (dataset filter)
```
"key", keyA:dataset:A, keyB:dataset:B, keyC:dataset:B
id0, valueA, valueB, valueC
(with dataset A)=> { id0 : valueA }
(with dataset B)=> { id0 : valueC }
```
- note: the value of the last found key passing dataset filter is used
- usecase: making a language pack from a locale spreadsheet