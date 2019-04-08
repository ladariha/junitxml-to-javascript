# junitxml-to-javascript
Pluggable jUnit XML reports parser to JavaScript objects

## Installation
    npm install junitxml-to-javascript
## Usage

### Parsing XML report file

    const Parser = require("junitxml-to-javascript");
    new Parser({customTag: "GENERAL1"})
        .parseXMLFile("/tmp/passed.xml")
        .then(report => console.log(JSON.stringify(report, null, 2)))
        .catch(err => console.error(e.message))
        
### Parsing XML report string

    const Parser = require("junitxml-to-javascript");
    new Parser({customTag: "GENERAL1"})
        .parseXMLString(`<?xml version="1.0" encoding="UTF-8"?>
            <testsuite name="1my.package.class.Something" errors="0" test="5" failures="0" skipped="0"
            timestamp="20171206T181624+0100" time="116.716">
                <properties></properties>
                <testcase classname="1my.package.class.Something" name="test00Monitoring" time="0.150">
                    <system-out>
                    </system-out>
                </testcase>
                <testcase classname="1my.package.class.Something" name="test01CreateJob" time="43.254">
                    <system-out>
                    </system-out>
                </testcase>
            </testsuite>`)
        .then(e => console.log(JSON.stringify(e, null, 2)))
        .catch(e => console.error(e.message))
### Sample output
    {
      "testsuites": [
        {
          "name": "1my.package.class.Something",
          "timestamp": 1512580584000,
          "properties": [],
          "testCases": [
            {
              "name": "test00Monitoring",
              "duration": 0.15,
              "result": "succeeded",
              "message": ""
            },
            {
              "name": "test01CreateJob",
              "duration": 43.25,
              "result": "succeeded",
              "message": ""
            }
          ],
          "succeeded": 2,
          "tests": 2,
          "errors": 0,
          "skipped": 0,
          "tag": "GENERAL",
          "durationSec": 43.4
        }
      ]
    }

### Basic API
#### New parser instance
     const Parser = require("junitxml-to-javascript");
     const p = new Parser()
#### New parser instance with custom modifier
You can add your own modifier function that will be called right after the XML
data are transformed to raw JavaScript object using library `xml2js-parser`
(transformed to match the output of the `xml2json` parser). This function:

 - will be given 1 parameter, the output of `xml2js-parser` parser
 - must be synchronous and must return object that will be further processed


```
     const Parser = require("junitxml-to-javascript");
     const p = new Parser({modifier : (xmlObject) => {
         const x = {};
         x.testsuites = xmlObject;
         return x;
     });
```
     
This is useful if your XML is not exactly as expected and you wish to preprocess

#### Parse XML string
    const Parser = require("junitxml-to-javascript");
    new Parser({customTag: "GENERAL1"})
        .parseXMLString(`<?xml version="1.0" encoding="UTF-8"?>
            <testsuite name="1my.package.class.Something" errors="0" test="5" failures="0" skipped="0"
            timestamp="20171206T181624+0100" time="116.716">
                <properties></properties>
                <testcase classname="1my.package.class.Something" name="test00Monitoring" time="0.150">
                    <system-out>
                    </system-out>
                </testcase>
                <testcase classname="1my.package.class.Something" name="test01CreateJob" time="43.254">
                    <system-out>
                    </system-out>
                </testcase>
            </testsuite>`)
        .then(e => console.log(JSON.stringify(e, null, 2)))
        .catch(e => console.error(e.message))   
#### Parse XML file with custom encoding
By default parser uses UTF-8 encoding. One can change that:

    const Parser = require("junitxml-to-javascript");
    new Parser()
        .parseXMLFile("/tmp/passed.xml", "utf16")
        .then(report => console.log(JSON.stringify(report, null, 2)))
        .catch(err => console.error(e.message))

#### Use time attribute from test suite instead of making sum of test cases for duration
By default parser uses `time` attribute of `testcase` element and sums all values to get total duration of test suite. However, sometimes it might be needed to use `time` attribute from `testsuite` element instead. One can change that by specifying `sumTestCasesDuration` to be false (default is true):

    const Parser = require("junitxml-to-javascript");
    new Parser({
            sumTestCasesDuration: false
         })
        .parseXMLFile("/tmp/passed.xml", "utf16")
        .then(report => console.log(JSON.stringify(report, null, 2)))
        .catch(err => console.error(e.message))
