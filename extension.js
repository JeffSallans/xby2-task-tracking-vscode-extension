// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const _ = require('lodash');
const taskTrackingService = require('./taskTrackingService');
const LoginAndHoursBar = require('./LoginAndHoursBar');

/**
 * Holds the default X by 2 auth information
 */
let defaultUserData = {
    username: null,
    password: null,
    isValid: false,
};

/**
 * Holds the X by 2 auth information
 */
var userData = defaultUserData;

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
        return taskTrackingService.isLoginValid(userData.username, userData.password)
    })
    .then((isValid) => {
        userData.isValid = isValid;
        if (!userData.isValid) {
            vscode.window.showErrorMessage('Invalid username and password combination.  Try again by re-running the command.');
        }
        loginAndHoursBar.update(userData, []);
    });
};

const submitTaskWorkflow = () => {
    let promise = Promise.resolve();
    // if not logged in, do that first
    if (_.isNil(userData.username) || _.isNil(userData.password)) {
        promise.then(() => loginWorkflow());
    }

    promise.then(() => {
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello Jeff!');
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