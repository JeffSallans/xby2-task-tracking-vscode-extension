/**
 * Node API for X by 2's task tracking website.
 * Currently, these do not include administative actions.
 */
const httpntlm = require('httpntlm');
const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash');

const baseUrl = `https://xby2apps.xby2.com/TaskManagement/`;

/**
 * The structure of a task
 */
const defaultTask = {
    // Required properties
    activityId: null,
    clientId: null,
    projectId: null,
    isBillable: true,
    date: new Date(),
    hours: '',
    minutes: '', // must be 0, 15, 30, or 45

    // Optional properties
    description: '',
};

/**
 * Parse the activity id from strings like 'edit(event,9999)'
 * @see http://regexr.com/3gi0j
 */
let activityIdRegex = /edit\(event,(\d*?)\)/g

/**
 * Returns the activity ids of the tasks on the given date
 *
 * @param {String} htmlAsString The HTML returned for the specific task
 * @param {Moment.Date} targetDate The given date as a moment object
 * @returns {Array.of.int} 
 */
const parseOutActivityIdListGivenDate = (htmlAsString, targetDate) => {
    const $ = cheerio.load(htmlAsString);
    const taskElementList = $(`td[onclick="popup(${targetDate.year()}, ${targetDate.month()+1}, ${targetDate.day()-1})"] p`) || [];
    return _.map(taskElementList, (taskElement) => {
        const taskOnClickText = taskElement.attribs.onclick;
        // Reset regex counter
        activityIdRegex.lastIndex = 0;
        const activityIdRegexMatch = activityIdRegex.exec(taskOnClickText) || [];
        const activityId = activityIdRegexMatch[1];
        return activityId;
    });
};

/**
 * Returns an object with the same structure as defaultTask for the given html
 * @param {String} htmlAsString The HTML returned for the specific task
 * @returns {Object} 
 */
const parseOutActivityDetails = (htmlAsString, activityId) => {
    const $ = cheerio.load(htmlAsString);
    const task = {
        activityId,
        clientId: Number($('#client option[selected="selected"]')[0].attribs.value),
        projectId: Number($('#project option[selected="selected"]')[0].attribs.value),
        taskId: Number($('#task option[selected="selected"]')[0].attribs.value),
        date: moment($('#date')[0].attribs.value),
        description: $('#activityDescription')[0].children[0].data,
        hours: Number($('[name="hrs"]')[0].attribs.value),
        minutes: Number($('[name="min"]')[0].attribs.value),
        isBillable: Boolean($('[name="billable"]')[0].attribs.value),
    };
    return Object.assign({}, defaultTask, task);
};

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
        return parseOutActivityIdListGivenDate(html, dateOrDefault);
    })
    // Retrieve all the html for the given activity id
    .then((activityIdList) => {
        const url = `${baseUrl}/Activities/Edit?ActivityID=${activityId}&redirection=true`;
        return new Promise((resolve, reject) => {
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
        });
    })
    // Parse the html for the activity information
    .then((html) => {
        return parseOutActivityDetails(html);
    });
};

const getWeeklyTasks = (username, password, date) => {
    const dateOrDefault = _.defaultTo(moment(date), moment());

};

const getMonthlyTasks = (username, password, date) => {
    const dateOrDefault = _.defaultTo(moment(date), moment());

};

const getClients = (username, password) => {

};

const submitTask = (username, password, task) => {

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
    parseOutActivityIdListGivenDate,
    parseOutActivityDetails,
};
