// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const _ = require('lodash');
const moment = require('moment');
const taskTrackingService = require('./taskTrackingService');
const LoginAndHoursBar = require('./LoginAndHoursBar');
const defaultTask = require('./defaultTask');
/**
 * Holds the default X by 2 auth information
 */
let defaultUserData = {
    username: null,
    password: null,
    /**
     * True if the username and password have connected to the server
     */
    isValid: false,
    /**
     * True if the program is waiting for the response for the login call
     */
    loginIsPending: false,
};

/**
 * Holds the X by 2 auth information
 */
var userData = defaultUserData;

var taskData = defaultTask;

/**
 * View to display information
 */
var loginAndHoursBar = null;

const loginWorkflow = () => {
    // The code you place here will be executed every time your command is executed

    // Prompt user for X by 2 auth info
    return vscode.window.showInputBox({
        prompt: 'Username',
    })
    .then((value) => {
        userData.username = value;
    })
    .then(() => {
        return vscode.window.showInputBox({
            prompt: 'password (don\'t worry this is only stored in local memory, never on disk)',
            password: true,
        });
    })
    .then((value) => {
        userData.password = value;
    })
    // Check if the username and password are valid
    .then(() => {
        if (_.isNil(userData.username) || _.isNil(userData.password)) return false;
        userData.loginIsPending = true;
        loginAndHoursBar.update(userData, []);        
        return taskTrackingService.isLoginValid(userData.username, userData.password)
    })
    .then((isValid) => {
        userData.loginIsPending = false;
        userData.isValid = isValid;
        if (!userData.isValid) {
            vscode.window.showErrorMessage('Invalid username and password combination.  Try again by re-running the command.');
        }
        loginAndHoursBar.update(userData, []);
    });
};

const submitTaskWorkflow = (givenTaskData = defaultTask) => {
    var clientList = [];
    var projectList = [];
    var taskTypeList = [];
    var taskDateList = [];
    const daysOfTheWeekList = [
        moment().day(-6), // last Monday
        moment().day(-5), // last Tuesday
        moment().day(-4), // last Wednesday
        moment().day(-3), // last Thursday
        moment().day(-2) // last Friday
    ];
    
    let promise = Promise.resolve();
    // if not logged in, do that first
    if (_.isNil(userData.username) || _.isNil(userData.password)) {
        promise.then(() => loginWorkflow());
    }

    return promise.then(() => {
        taskDateList = _.map(daysOfTheWeekList, (dayOfTheWeek) => {
            return `${moment(dayOfTheWeek).format('M/D dddd')} - 0/0h`;
        })

        if (givenTaskData !== defaultTask) return `${givenTaskData.date.format('M/D dddd')} - 0/0h`;
        return vscode.window.showQuickPick(taskDateList, {
            prompt: 'Select Date',
        });
    }).then((value) => {
        const valueOrDefault = _.defaultTo(value, '');
        const selectedDate = _.find(daysOfTheWeekList, dayOfTheWeek => 
            valueOrDefault.indexOf(moment(dayOfTheWeek).format('dddd')) !== -1
        ) || moment();

        // Initialize task data
        taskData = Object.assign({}, givenTaskData);
        taskData.date = selectedDate;

        return taskTrackingService.getClients(userData.username, userData.password, taskData.date);
    })
    .then((clients) => {
        clientList = clients;
        const clientNames = _.map(clientList, client => client.Name);
        if (givenTaskData !== defaultTask) return taskData.clientName;
        return vscode.window.showQuickPick(clientNames, {
            prompt: 'Select Client',
        });
    })
    .then((value) => {
        const client = _.find(clientList, client => client.Name === value) || {};
        taskData.clientId = client.Id;
        taskData.clientName = client.Name;
        return taskTrackingService.getProjects(userData.username, userData.password, taskData.clientId);
    })
    .then((projects) => {
        projectList = projects;
        const projectNames = _.map(projectList, project => project.Name);
        if (givenTaskData !== defaultTask) return taskData.projectName;        
        return vscode.window.showQuickPick(projectNames, {
            prompt: 'Select Project',
        });
    })
    .then((value) => {
        const project = _.find(projectList, project => project.Name === value) || {};
        taskData.projectId = project.Id;
        taskData.projectName = project.Name;        
        return taskTrackingService.getTasks(userData.username, userData.password, taskData.projectId);
    })
    .then((tasks) => {
        taskTypeList = tasks;
        const taskNames = _.map(taskTypeList, task => task.Name);
        if (givenTaskData !== defaultTask) return taskData.taskName;                
        return vscode.window.showQuickPick(taskNames, {
            prompt: 'Select Task',
        });
    })
    .then((value) => {
        const task = _.find(taskTypeList, task => task.Name === value) || {};
        taskData.taskId = task.Id;
        taskData.taskName = task.Name;        
    })
    .then(() => {
        if (givenTaskData !== defaultTask) return taskData.isBillable;                        
        return vscode.window.showQuickPick(['billable', 'non-billable'], {
            prompt: 'Is the task billable?',
        });
    })
    .then((value) => {
        taskData.isBillable = value === 'billable';
    })
    .then(() => {
        return vscode.window.showInputBox({
            prompt: 'Select Hours (accepts decimals .25, .5, .75)',
        });
    })
    .then((value) => {
        const duration = moment.duration(Number(value) * 60, 'minutes');        
        taskData.hours = Number(duration.hours());
        const pendingMinutes = Number(duration.minutes());

        if (pendingMinutes % 15 !== 0) {
            const errorMessage = 'Can only track tasks with the grainularity of 15 minute increments';
            throw errorMessage;
        }

        taskData.minutes = pendingMinutes;
    })
    .then(() => {
        return vscode.window.showInputBox({
            prompt: 'What did you do?',
        });
    })
    .then((value) => {
        taskData.description = value;
        return taskTrackingService.submitTask(userData.username, userData.password, taskData);
    })
    .then((saveSucceeded) => {
        if (saveSucceeded) {
            const leanTaskDate = taskData.date.format('M/D');
            const billableText = (taskData.isBillable) ? 'billable' : 'non-billable';
            vscode.window.showInformationMessage(`${leanTaskDate} task was created with ${taskData.hours}:${taskData.minutes} ${billableText} hours`);
        }
        else {
            vscode.window.showErrorMessage('Task was not created, please try again');
        }
    })
    .catch((errorMessage) => {
        return vscode.window.showErrorMessage(errorMessage)
        .then(() => {
            return submitTaskWorkflow(taskData);                            
        })
    });
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "xby2-task-tracking" is now active!');

    loginAndHoursBar = new LoginAndHoursBar();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var loginDisposable = vscode.commands.registerCommand('extension.login', loginWorkflow);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var submitTaskDisposable = vscode.commands.registerCommand('extension.submitTask', submitTaskWorkflow);


    context.subscriptions.push(loginDisposable);
    context.subscriptions.push(submitTaskDisposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    userData = defaultUserData;
    loginAndHoursBar.dispose();
    console.log('Your extension "xby2-task-tracking" has deactivated.  User data is cleared from memory.');
}
exports.deactivate = deactivate;