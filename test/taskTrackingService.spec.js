/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const fs = require('fs');
const moment = require('moment');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const taskTrackingService = require('../taskTrackingService');
const getProjects = require('./mock-requests/get-projects.json');
const getTasks = fs.readFileSync('./test/mock-requests/get-tasks.json');

xdescribe("Task Tracking Service", function() {

    
});
