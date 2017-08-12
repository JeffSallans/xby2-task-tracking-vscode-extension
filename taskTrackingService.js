/**
 * Node API for X by 2's task tracking website.
 * Currently, these do not include administative actions.
 */
const httpntlm = require('httpntlm');
const cheerio = require('cheerio');

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
    var userDataReadyPromise = new Promise((resolve, reject) => {
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
    return userDataReadyPromise;
};

const getDailyHours = (username, password) => {

};

const getWeeklyHours = (username, password) => {

};

const getMonthlyHours = (username, password) => {

};

const getClients = (username, password) => {

};

const submitHours = (username, password) => {

};

module.exports = {
    isLoginValid,
    getDailyHours,
    getWeeklyHours,
    getMonthlyHours,
    getClients,
    submitHours,
};
