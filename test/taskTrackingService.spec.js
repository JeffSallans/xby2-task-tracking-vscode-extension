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
const getTasks = require('./mock-requests/get-tasks.json');
const getTaskDetails = fs.readFileSync('./test/mock-requests/get-task-details.html');
const getTasksMonthView = fs.readFileSync('./test/mock-requests/get-tasks-month-view.html');

jest.mock('httpntlm', () => ({
    get: jest.fn(() => ({})),
    post: jest.fn(() => ({})),
}));
const httpntlm = require('httpntlm');

describe("Task Tracking Service", () => {

    describe("getWeeklyTasks", () => {
        
        it('returns the correct data for the week of August 12 using mock data', () => {
            httpntlm.post.mockImplementationOnce((settings, callback) => {
                callback(null, {
                    statusCode: 200,
                    body: getTasksMonthView.toString(),
                });
            });
            return taskTrackingService.getWeeklyTasks('test-username', 'test-password', '08-02-2017')
            .then((weeklyTasks) => {
                expect(weeklyTasks).toMatchSnapshot();
            })
        });
    });

    describe("getMonthlyTasks", () => {
            
        it('returns the correct data for the week of August 12 using mock data', () => {
            httpntlm.post.mockImplementationOnce((settings, callback) => {
                callback(null, {
                    statusCode: 200,
                    body: getTasksMonthView.toString(),
                });
            });
            return taskTrackingService.getMonthlyTasks('test-username', 'test-password', '08-02-2017')
            .then((monthlyTasks) => {
                expect(monthlyTasks).toMatchSnapshot();
            })
        });
    });

    describe("getClients", () => {
        
        it('returns the correct data for the week of August 12 using mock data', () => {
            httpntlm.get.mockImplementationOnce((settings, callback) => {
                callback(null, {
                    statusCode: 200,
                    body: getTaskDetails.toString(),
                });
            });
            return taskTrackingService.getClients('test-username', 'test-password', '08-02-2017')
            .then((clients) => {
                expect(clients).toMatchSnapshot();
            })
        });
    });
});
