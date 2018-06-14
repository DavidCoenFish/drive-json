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
## Google drive access

## Spreadsheet data conventions
markup cells contain non empty string of tokens, names, dataset, all seperated by ":"

### markup tokens
-ignore
-int
-float
-bool
-string
-sheet3rd
-sheet5th
-sheet3rdKeyValue
-array
-dataset:xxx

3rd normailized
```
"_id", keyA, keyB
id0, value0A, value0B
id1, value1A, value1B
=> { id0 : { keyA : value0A, keyB : value0B }, id1 : { keyA : value1A, keyB : value1B } }
```

5th normailized
```
key0, value0
key1, value1
=> { key0 : value0, key1 : value1 }
```

3rd normailized key value (dataset filter)
```
"key", keyA:dataset:A, keyB:dataset:B, keyC:dataset:B
id0, valueA, valueB, valueC
(with dataset A)=> { id0 : valueA }
(with dataset B)=> { id0 : valueC }
```
note: the value of the last found key passing dataset filter is used
usecase: making a language pack from a locale spreadsheet