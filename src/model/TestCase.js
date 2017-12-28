"use strict";
const isNull = require("../util").isNull;
const toFloat = require("../util").toFloat;

const FAILURE_KEYS = ["error", "failure", "rerunFailure"];
const SKIP_KEYS = ["skip", "skipped"];
const FAILED_RESULT = "failed";
const SKIPPED_RESULT = "skipped";
const SUCCEEDED_RESULT = "succeeded";

function TestCase(caseObject) {
    const self = this;
    this.name = caseObject.name;
    this.duration = toFloat(caseObject.time);
    this.result = SUCCEEDED_RESULT;
    this.message = "";
    FAILURE_KEYS.forEach(x => {
        if (!isNull(caseObject[x])) {
            self.result = FAILED_RESULT;
            self.message = isNull(caseObject[x].message) ? "" : caseObject[x].message;
        }
    });
    SKIP_KEYS.forEach(x => {
        if (!isNull(caseObject[x])) {
            self.result = SKIPPED_RESULT;
            self.message = isNull(caseObject[x].message) ? "" : caseObject[x].message;
        }
    });
}

TestCase.prototype.isFailed = function () {
    return this.result === FAILED_RESULT;
};
TestCase.prototype.isSkipped = function () {
    return this.result === SKIPPED_RESULT;
};

module.exports = TestCase;