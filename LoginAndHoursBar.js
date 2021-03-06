const _ = require('lodash');
// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
const vscode = require('vscode');
//import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode';

class LoginAndHoursBar {

    constructor() {
        this._statusBarTitle = 'X by 2';

        // This login bar always starts visible with an option to login
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this._statusBarItem.tooltip = 'X by 2 Task Tracking Extension';
        this._statusBarItem.text = `${this._statusBarTitle}: Click To Log In`;
        this._statusBarItem.command = 'login';
        this._statusBarItem.show();
    }

    /**
     * Updates the display of the status bar
     * @param {Object} userData with properties username and isValid 
     * @param {Array.of.Object} weeklyTasks Array of tasks for this week including properties isBillable and hours
     */
    update(userData, weeklyTasks) {

        if (userData.loginIsPending) {
            this._statusBarItem.text = `${this._statusBarTitle}: Logging in, please wait...`;
            this._statusBarItem.command = '';
            this._statusBarItem.show();  
            return;
        }
        
        if (!userData.isValid) {
            this._statusBarItem.text = `${this._statusBarTitle}: Invalid Login, Click To Try Again`;
            this._statusBarItem.command = 'login';
            this._statusBarItem.show();            
            return;
        }

        const loginMessage = `${userData.username}`;
        const billableTasks = _.filter(weeklyTasks, task => task.isBillable);
        const billableHours = _.reduce(billableTasks, (hoursSoFar, task) => {
            return hoursSoFar + task.hours + (task.minutes / 60.0);
        }, 0);
        const nonBillableTasks = _.filter(weeklyTasks, task => !task.isBillable);
        const nonBillableHours = _.reduce(nonBillableTasks, (hoursSoFar, task) => {
            return hoursSoFar + task.hours + (task.minutes / 60.0);
        }, 0);

        this._statusBarItem.text = `${this._statusBarTitle}: ${loginMessage} ${billableHours}/${nonBillableHours}h`;
        this._statusBarItem.command = 'submitTask';
        this._statusBarItem.show();        
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

module.exports = LoginAndHoursBar;
