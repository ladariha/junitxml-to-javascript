"use strict";
const parser = require("xml2js-parser").parseStringSync;
const fs = require("fs");
const Report = require("../model/Report");

/**
 * Returns new instance of Parser
 * @param modifier
 * @param customTag
 * @constructor
 */
function Parser({modifier = null, customTag = "GENERAL", sumTestCasesDuration = true} = {}) {
    this.modifier = modifier;
    this.sumTestCasesDuration = sumTestCasesDuration;
    this.customTag = customTag;
}

Parser.prototype._createReportObject = function (reportJsonObj) {
    if (this.modifier) {
        reportJsonObj = this.modifier(reportJsonObj);
    }
    return Report.create(reportJsonObj, this.customTag, this.sumTestCasesDuration);
};

// Make xml2js-parser output like xml2json
// e.g. recursively merge '$'-elements, flatten arrays of size 0 or 1, etc.
function undollar(node) {
    const ret = {};
    if (Array.isArray(node)) {
        if (node.length === 1 && Object.keys(node[0]).length === 0) {
            return node[0];
        } else if (node.length == 1 && typeof node[0] === 'string') {
            return node[0];
        } else if (node.length > 1) {
            return node.map(element => undollar(element));
        } else {
            const keys = Object.keys(node[0]);
            if (keys.some(key => key !== '' + parseInt(key)))
                return undollar(node[0]);
            else
                return keys
                    .sort((a, b) => parseInt(b) - parseInt(a))
                    .reduce((prev, cur) => prev + cur)
                    .trim();
        }
    }

    if (typeof node === 'string') {
      return node;
    }

    Object.keys(node).forEach(key => {
        const val = node[key];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            if (key === '$') {
                Object.assign(ret, undollar(val));
            } else {
                ret[key] = undollar(val);
            }
        } else if (Array.isArray(val)) {
            if (key === 'error' && val.length > 0 && typeof val[0] === 'object' && val[0]['$']) {
                ret[key] = {
                    message: val[0]['$']['message'],
                    '$t': (val[0]['_'] || '').trim(),
                };
            } else if (key === 'system-out' && val.length > 0) {
                ret[key] = val[0].trim();
            } else if (['properties', 'skipped'].includes(key) && val.length === 1) {
                ret[key] = typeof val[0] === 'string' ? val[0].trim() : undollar(val[0]);
            } else {
                ret[key] = undollar(val);
            }
        } else {
            ret[key] = val;
        }
    });
    return ret;
}

Parser.prototype.parseXMLString = function (xmlString) {
    return Promise.resolve(this._createReportObject(undollar(parser(xmlString))));
};

Parser.prototype.parseXMLFile = function (pathToXMLFile, encoding = "utf8") {
    return new Promise((resolve, reject) => {
        fs.readFile(pathToXMLFile, encoding, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(this._createReportObject(undollar(parser(data))));
            }
        });
    });
};

module.exports = Parser;
