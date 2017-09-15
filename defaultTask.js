const moment = require('moment');

/**
 * The structure of a task
 */
const defaultTask = {
    // Required properties
    activityId: null,
    clientId: null,
    clientName: '',
    projectId: null,
    projectName: '',
    taskId: null,
    taskName: '',
    isBillable: true,
    date: moment(),
    hours: 0,
    minutes: 0, // must be 0, 15, 30, or 45

    // Optional properties
    description: '',
};

module.exports = defaultTask;
