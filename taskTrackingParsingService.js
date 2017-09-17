/**
 * Node API for X by 2's task tracking website.
 * Currently, these do not include administative actions.
 */
const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash');
const defaultTask = require('./defaultTask');

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
        clientName: $('#client option[selected="selected"]').text(),
        projectId: Number($('#project option[selected="selected"]')[0].attribs.value),
        projectName: $('#project option[selected="selected"]').text(),        
        taskId: Number($('#task option[selected="selected"]')[0].attribs.value),
        taskName: $('#task option[selected="selected"]').text(),                
        date: moment($('#date')[0].attribs.value),
        description: $('#activityDescription')[0].children[0].data,
        hours: Number($('[name="hrs"]')[0].attribs.value),
        minutes: Number($('[name="min"]')[0].attribs.value),
        isBillable: Boolean($('[name="billable"]')[0].attribs.value),
    };
    return Object.assign({}, defaultTask, task);
};

/**
 * Returns an object with the same structure as defaultTask for the given html
 * @param {String} htmlAsString The HTML returned for the specific task
 * @returns {Object} 
 */
const parseOutClientOptions = (htmlAsString) => {
    const $ = cheerio.load(htmlAsString);
    const clientElementList = $('#client option');
    return _.map(clientElementList, (clientElement) => {
        return {
            Id: Number(clientElement.attribs.value),
            Name: _.get(clientElement, 'children[0].data'),
            isDefault: Boolean(clientElement.attribs.selected),
        };
    }) || [];
};

/**
 * parse out the client and hours for the tasks
 * @see - http://regexr.com/3gooa
 */
const getClientAndHoursRegex = /(.*)(?: \- )+?(\d\d?)(\.\d\d?)? hrs/g;

/**
 * Returns the list of tasks for the week for the given date
 *
 * @param {String} htmlAsString The HTML returned for the specific task
 * @param {Moment.Date} targetDate The given date as a moment object
 * @returns {Array.Object} - Returns an array of object like defaultTask
 */
const parseOutTasksOfTheWeek = (htmlAsString, targetDate) => {
    const $ = cheerio.load(htmlAsString);
    const thisWeek = [
        moment(targetDate).day(1), // Monday
        moment(targetDate).day(2), // Tuesday
        moment(targetDate).day(3), // Wednesday
        moment(targetDate).day(4), // Thursday
        moment(targetDate).day(5) // Friday
    ];

    return _.transform(thisWeek, (resultSoFar, dayOfTheWeek) => {
        const taskListElements = $(`td[onclick="popup(${dayOfTheWeek.format('YYYY, M, D')})"] p[class^="found"]`) || [];
        const taskList = _.map(taskListElements, (task) => {
            // Reset regex counter
            getClientAndHoursRegex.lastIndex = 0;
            const taskDescription = _.get(task, 'children[0].data') || '';
            const getClientAndHoursRegexMatch = getClientAndHoursRegex.exec(taskDescription) || [];
            const clientName = getClientAndHoursRegexMatch[1];
            const hours = Number(getClientAndHoursRegexMatch[2]) || 0;
            const fractionalHours = Number(getClientAndHoursRegexMatch[3]) || 0;        
            return Object.assign({}, defaultTask, {
                date: dayOfTheWeek,
                clientName,
                hours,
                minutes: fractionalHours * 60,
                isBillable: task.attribs.class === "foundBillableTime",
            });
        });
        taskList.forEach((task) => {
            resultSoFar.push(task);
        });
    }, []);
};

/**
 * Returns the list of tasks for the month for the given date
 *
 * @param {String} htmlAsString The HTML returned for the specific task
 * @param {Moment.Date} targetDate The given date as a moment object
 * @returns {Array.Object} - Returns an array of object like defaultTask
 */
const parseOutTasksOfTheMonth = (htmlAsString, targetDate) => {
    const $ = cheerio.load(htmlAsString);
    const maxDaysInAMonth = 31;
    let thisMonth = [];
    for (let index = 1; index <= maxDaysInAMonth; index++) {
        const date = moment(targetDate.format(`MM-${index}-YYYY`))
        thisMonth.push(date);
    }

    return _.transform(thisMonth, (resultSoFar, dayOfTheWeek) => {
        const taskListElements = $(`td[onclick="popup(${dayOfTheWeek.format('YYYY, M, D')})"] p[class^="found"]`) || [];
        const taskList = _.map(taskListElements, (task) => {
            // Reset regex counter
            getClientAndHoursRegex.lastIndex = 0;
            const taskDescription = _.get(task, 'children[0].data') || '';
            const getClientAndHoursRegexMatch = getClientAndHoursRegex.exec(taskDescription) || [];
            const clientName = getClientAndHoursRegexMatch[1];
            const hours = Number(getClientAndHoursRegexMatch[2]) || 0;
            const fractionalHours = Number(getClientAndHoursRegexMatch[3]) || 0;        
            return Object.assign({}, defaultTask, {
                date: dayOfTheWeek,
                clientName,
                hours,
                minutes: fractionalHours * 60,
                isBillable: task.attribs.class === "foundBillableTime",
            });
        });
        taskList.forEach((task) => {
            resultSoFar.push(task);
        });
    }, []);
};

module.exports = {
    parseOutActivityIdListGivenDate,
    parseOutActivityDetails,
    parseOutClientOptions,
    parseOutTasksOfTheWeek,
    parseOutTasksOfTheMonth,
};
