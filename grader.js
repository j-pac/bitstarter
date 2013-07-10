#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var util = require('util');
var rest = require('restler');
var HTMLFILE_DEFAULT ="index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var JSON_OUTPUT = "grader_output.txt";


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
	}
    return instr;
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlFileByUrl = function(htmlfile) {
    return cheerio.load(htmlfile);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlFile = function(htmlfile, checksfile) {
    $ = htmlfile;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};


var clone = function(fn) {
    return fn.bind({});
};


var createJsonOutput = function(checkJson) {
    var outJson = JSON.stringify(checkJson, null, 4);
    fs.writeFileSync(JSON_OUTPUT, outJson);
};


if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
  	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <link>', 'URL to index.html')
	.parse(process.argv);

    var CheckJson;

    if(program.url) {
	rest.get(program.url).on('complete', function(result) {
	    if(result instanceof Error) {
		console.error('Error: ' + util.format(result.message));
	    } else {
		checkJson = checkHtmlFile(cheerioHtmlFileByUrl(result), program.checks);
		createJsonOutput(checkJson);
	    }
	});
    } else {
	checkJson = checkHtmlFile(cheerioHtmlFile(program.file), program.checks); 
	createJsonOutput(checkJson);
}

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
