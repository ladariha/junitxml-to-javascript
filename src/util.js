"use strict";

function isNull(x) {
    return x === null || typeof x === "undefined";
}

function toFloat(val) {
    return parseFloat((isNull(val) ? 0 : parseFloat(val)).toFixed(3));
}

exports.isNull = isNull;
exports.toFloat = toFloat;