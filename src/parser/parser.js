"use strict";
const parser = require("xml2json");
const fs = require("fs");
const Report = require("../model/Report");

/**
 * Returns new instance of Parser
 * @param modifier
 * @param customTag
 * @constructor
 */
function Parser({modifier = null, customTag = "GENERAL"} = {}) {
    this.modifier = modifier;
    this.customTag = customTag;
}

Parser.prototype._createReportObject = function (reportJsonObj) {
    if (this.modifier) {
        reportJsonObj = this.modifier(reportJsonObj);
    }
    return Report.create(reportJsonObj, this.customTag);
};

Parser.prototype.parseXMLString = function (xmlString) {
    return Promise.resolve(this._createReportObject(JSON.parse(parser.toJson(xmlString))));
};

Parser.prototype.parseXMLFile = function (pathToXMLFile, encoding = "utf8") {
    return new Promise((resolve, reject) => {
        fs.readFile(pathToXMLFile, encoding, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(this._createReportObject(JSON.parse(parser.toJson(data))));
            }
        });
    });
};

module.exports = Parser;