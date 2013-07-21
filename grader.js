#!/usr/bin/env node

var fs = require('fs');
var request = require('request');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        //console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    return checkHtml($, checksfile);
};

var checkHtml = function($, checksfile) {
    var checks = loadChecks(checksfile).sort();
//    console.log(checks);
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var printResult = function(checkJson) {
    console.log(JSON.stringify(checkJson, null, 4));
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to index.html')
        .parse(process.argv);

    if (program.url) {
	request(program.url, function(err, resp, body){
	    $ = cheerio.load(body);
	    var checkJson = checkHtml($, program.checks);
	    printResult(checkJson);
	});
    } else {
	var checkJson = checkHtmlFile(program.file, program.checks);
	printResult(checkJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
