/**
 * Node API for X by 2's task tracking website.
 * Currently, these do not include administative actions.
 */
const httpntlm = require('httpntlm');
const moment = require('moment');
const _ = require('lodash');
const taskTrackingParsingService = require('./taskTrackingParsingService');

const baseUrl = `https://xby2apps.xby2.com/TaskManagement/`;

/**
 * Returns a promise that resolves to True if the username and password are valid
 *
 * @example
```
    .then(() => {
        return taskTrackingService.isLoginValid(userData.username, userData.password)
    })
    .then((isValid) => {
        userData.isValid = isValid;
        if (!userData.isValid) {
            vscode.window.showErrorMessage('Invalid username and password combination.  Try again by re-running the command.');
        }
    });
```
 * @param {string} username The user's X by 2 Active Directory username
 * @param {string} password The user's X by 2 Active Directory password
 * @returns {Promise.resolves.bool}
 */
const isLoginValid = (username, password) => {
    return new Promise((resolve, reject) => {
        var url = baseUrl;
        httpntlm.get({
            url: baseUrl,
            username: username,
            password: password,
            workstation: 'choose.something',
            domain: ''
        }, function (error, response){
            console.log(`${url} returned statusCode: ${response.statusCode}`);
            
            if(error) {
                reject(error);
                return;
            }

            const isValid = response.statusCode >= 200 && response.statusCode < 400;
            resolve(isValid);
        });
    });
};

const getDailyTasks = (username, password, date) => {
    // Get all tasks for this month
    return new Promise((resolve, reject) => {
        var url = baseUrl;
        httpntlm.get({
            url,
            username: username,
            password: password,
            workstation: 'choose.something',
            domain: ''
        }, function (error, response) {
            console.log(`${url} returned statusCode: ${response.statusCode}`);
            
            if(error || response.statusCode >= 400) {
                reject(error);
                return;
            }

            resolve(response.body);
        });
    })
    // Parse the html for the activity id for the given date
    .then((html) => {
        const dateOrDefault = _.defaultTo(moment(date), moment());
        return taskTrackingParsingService.parseOutActivityIdListGivenDate(html, dateOrDefault);
    })
    // Retrieve all the html for the given activity id
    .then((activityIdList) => {
        const promises = _.map(activityIdList, (activityId) => {
            return new Promise((resolve, reject) => {
                const url = `${baseUrl}/Activities/Edit?ActivityID=${activityId}&redirection=true`;
                httpntlm.get({
                    url,
                    username: username,
                    password: password,
                    workstation: 'choose.something',
                    domain: ''
                }, function (error, response) {
                    console.log(`${url} returned statusCode: ${response.statusCode}`);
                    
                    if(error || response.statusCode >= 400) {
                        reject(error);
                        return;
                    }
                    const parsedTask = taskTrackingParsingService.parseOutActivityDetails(response.body, activityId);
                    resolve(parsedTask);
                });
            });
        });
        return Promise.all(promises);
    });
};

const getWeeklyTasks = (username, password, date) => {
    const dateOrDefault = _.defaultTo(moment(date), moment());
    throw "Not Implemented Yet";
};

const getMonthlyTasks = (username, password, date) => {
    const dateOrDefault = _.defaultTo(moment(date), moment());
    throw "Not Implemented Yet";
};

const getClients = (username, password) => {

};

const getProjects = (username, password) => {
    
};

const getTasks = (username, password) => {
    
};

const submitTask = (username, password, taskData) => {

};

const deleteTask = (username, password, taskId) => {

};

module.exports = {
    isLoginValid,
    getDailyTasks,
    getWeeklyTasks,
    getMonthlyTasks,
    getClients,
    submitTask,
    deleteTask,
};
