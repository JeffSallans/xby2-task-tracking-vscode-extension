// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const _ = require('lodash');
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

const submitTaskWorkflow = () => {
    var clientList = [];
    var projectList = [];
    var taskList = [];
    
    let promise = Promise.resolve();
    // if not logged in, do that first
    if (_.isNil(userData.username) || _.isNil(userData.password)) {
        promise.then(() => loginWorkflow());
    }

    return promise.then(() => {
        // Initialize task data
        taskData = defaultTask;
        return taskTrackingService.getClients(userData.username, userData.password);
    })
    .then((clients) => {
        clientList = clients;
        const clientNames = _.map(clientList, client => client.Name);
        return vscode.window.showQuickPick(clientNames, {
            prompt: 'Select Client',
        });
    })
    .then((value) => {
        const client = _.find(clientList, client => client.Name === value) || {};
        taskData.clientId = client.Id;
        return taskTrackingService.getProjects(userData.username, userData.password, taskData.clientId);
    })
    .then((projects) => {
        projectList = projects;
        const projectNames = _.map(projectList, project => project.Name);
        return vscode.window.showQuickPick(projectNames, {
            prompt: 'Select Project',
        });
    })
    .then((value) => {
        const project = _.find(projectList, project => project.Name === value) || {};
        taskData.projectId = project.Id;
        return taskTrackingService.getTasks(userData.username, userData.password, taskData.projectId);
    })
    .then((tasks) => {
        taskList = tasks;
        const taskNames = _.map(taskList, task => task.Name);
        return vscode.window.showQuickPick(taskNames, {
            prompt: 'Select Task',
        });
    })
    .then((value) => {
        const task = _.find(taskList, task => task.Name === value) || {};
        taskData.taskId = task.Id;
    })
    .then(() => {
        return vscode.window.showQuickPick(['billable', 'non-billable'], {
            prompt: 'Is the task billable?',
        });
    })
    .then((value) => {
        taskData.isBillable = value === 'billable';
    })
    .then(() => {
        return vscode.window.showInputBox({
            prompt: 'Select Hours',
        });
    })
    .then((value) => {
        taskData.hours = Number(value);
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
            vscode.window.showInformationMessage('Task was created');
        }
        else {
            vscode.window.showErrorMessage('Task was not created, please try again');
        }
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