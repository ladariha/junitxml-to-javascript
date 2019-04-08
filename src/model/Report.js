"use strict";

const isNull = require("../util").isNull;
const TestSuite = require("./TestSuite");

/**
 * Sanitizes the object based on
 * https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report.xsd
 * https://www.ibm.com/support/knowledgecenter/en/SSQ2R2_14.0.0/com.ibm.rsar.analysis.codereview.cobol.doc/topics/cac_useresults_junit.html
 * and some common mistakes
 * @param resultObject
 * @param {String} customTag
 * @constructor
 */
function Report(resultObject, customTag, sumTestCasesDuration) {
    // first fix some common issues
    let suites = resultObject.testsuites || (resultObject.testsuite || []);

    if (!isNull(resultObject.testsuites) && isNull(resultObject.testsuites.testsuite)) {
        suites = [];
    }

    if (!isNull(resultObject.testsuites) && !isNull(resultObject.testsuites.testsuite)) {
        suites = resultObject.testsuites.testsuite;
    }

    if (isNull(suites.forEach)) {
        suites = [suites];
    }

    const existingSuites = new Map();
    suites.forEach(x => {

        let currentProperties = [];
        if (!isNull(x.properties) && !isNull(x.properties.property) && isNull(x.properties.property.forEach)) { // single item is parsed in to Object
            currentProperties = [x.properties.property];
        } else if (!isNull(x.properties) && typeof x.properties !== "string" && x.properties.property) {
            currentProperties = x.properties.property;
        }

        if (!existingSuites.has(x.name)) {
            existingSuites.set(x.name, new TestSuite(x.name, x.timestamp, currentProperties, customTag, sumTestCasesDuration, x.time));
        }

        let tc = x.testcase || [];
        if (!isNull(x.testcase) && isNull(x.testcase.forEach)) { // single item is parsed in to Object
            tc = [x.testcase];
        }

        tc.forEach(y => {
            const suiteName = isNull(y.classname) ? x.name : y.classname;
            if (!existingSuites.has(suiteName)) {
                existingSuites.set(suiteName, new TestSuite(suiteName, x.timestamp, currentProperties, customTag, sumTestCasesDuration, x.time));
            }

            existingSuites.get(suiteName).addTestCase(y);
        });
    });
    //     new TestSuite(x, existingSuites);
    this.testsuites = [...existingSuites.values()].filter(x => x.testCases.length > 0);

}

/**
 *
 * @param resultObj
 * @param customTag
 * @return {Report}
 */
exports.create = (resultObj, customTag, sumTestCasesDuration) => new Report(resultObj, customTag, sumTestCasesDuration);