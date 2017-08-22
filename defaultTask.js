
/**
 * The structure of a task
 */
const defaultTask = {
    // Required properties
    activityId: null,
    clientId: null,
    clientName: 'Client',
    projectId: null,
    projectName: 'Project',
    taskId: null,
    taskName: 'Task',
    isBillable: true,
    date: new Date(),
    hours: '',
    minutes: '', // must be 0, 15, 30, or 45

    // Optional properties
    description: '',
};

module.exports = defaultTask;
