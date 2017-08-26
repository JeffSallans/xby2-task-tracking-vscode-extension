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
const getTasks = fs.readFileSync('./mock-requests/get-tasks.json');

// Defines a Mocha test suite to group tests of similar kind together
describe("Task Tracking Service", function() {

    // Defines a Mocha unit test
    it("parseOutActivityIdListGivenDate to work for mock html", function() {
        const activityIds = taskTrackingService.parseOutActivityIdListGivenDate(getTasksMonthView, moment('08-02-2017', 'MM-DD-YYYY'));
        expect(activityIds).toMatchSnapshot();
    });

    it("parseOutActivityDetails to work for mock html", function() {
        const task = taskTrackingService.parseOutActivityDetails(getTaskDetails, 229268);
        expect(task).toMatchSnapshot();
    });
});