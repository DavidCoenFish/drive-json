const DealTest = function(testName, value, expected)
{
	var success = (value === expected);
	if (true != success)
	{
		DealTestFail(testName + " value: " + value + " expected:" + expected);
	}

	return;
}
module.exports.DealTest = DealTest;

const DealTestNot = function(testName, value, expected)
{
	var success = (value !== expected);
	if (true != success)
	{
		DealTestFail(testName + " value: " + value + " notExpected:" + expected);
	}

	return;
}
module.exports.DealTestNot = DealTestNot;

const DealTestRange = function(testName, value, expectedLow, expectedHigh)
{
	var success = ((expectedLow <= value) && (value < expectedHigh));
	if (true != success)
	{
		DealTestFail(testName + " value: " + value + " expectedLow:" + expectedLow + " expectedHigh:" + expectedHigh);
	}

	return;
}
module.exports.DealTestRange = DealTestRange;

const DealTestFail = function(testName)
{
	throw testName;
}
module.exports.DealTestFail = DealTestFail;
