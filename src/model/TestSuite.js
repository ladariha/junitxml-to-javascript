"use strict";
const TestCase = require("./TestCase");
const toFloat = require("../util").toFloat;

// 20171122T203218+0100
const WEIRD_PATTERN_1 = /^([0-9]{4})([0-9]{2})([0-9]{2})T([0-9]{2})([0-9]{2})([0-9]{2})\+([0-9]{4})$/;

/**
 *
 * @param {string} dateTime
 * @return {number}
 */
function parseTimestamp(dateTime) {
    const m = dateTime.match(WEIRD_PATTERN_1);
    if (m) {
        return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+${m[7]}`).getTime();
    } else {
        return new Date(dateTime).getTime();
    }
}

function TestSuite(suiteName, timestamp, properties = [], customTag = "GENERAL") {
    this.name = suiteName;
    // either 20171124T101817+0100 or 2017-11-24T08:43:08
    this.timestamp = timestamp ? parseTimestamp(timestamp) : Date.now();
    this.properties = properties;
    this.testCases = [];
    // results
    this.succeeded = 0;
    this.tests = 0;
    this.errors = 0;
    this.skipped = 0;
    this.tag = customTag;
    this.durationSec = 0; // in secs
}

TestSuite.prototype.addTestCase = function (caseObject) {
    let x = new TestCase(caseObject);
    if (x.isFailed()) {
        this.errors++;
    } else if (x.isSkipped()) {
        this.skipped++;
    } else {
        this.succeeded++;
    }
    this.tests++;
    this.durationSec = toFloat(this.durationSec + x.duration);
    this.testCases.push(x);

};

module.exports = TestSuite;