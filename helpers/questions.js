const db = require('./connection');

//Query is asynchronous, it'll return undefined without using async/await. This function returns a promise that resolves to an array of CURRENT departments
const currentDepartments = function () {
    return new Promise((resolve, reject) => {
        db.query('SELECT name FROM department', function (err, results) {
            if (err) reject(err);
            const departments = results.map(result => result.name);
            resolve(departments);
        });
    });
}

// Shows all current roles when called
const currentRoles = function () {
    return new Promise((resolve, reject) => {
        db.query('SELECT title FROM role', function (err, results) {
            if (err) reject(err);
            const roles = results.map(result => result.title);
            resolve(roles);
        });
    });
}

// Will show an updated list of ALL employees
const currentManagers = function () {
    return new Promise((resolve, reject) => {
        db.query('SELECT CONCAT(first_name, " ", last_name) FROM employee', function (err, results) {
            if (err) reject(err);

            // Taking the result of the concatenated first and last name
            const managers = results.map(result => result[`CONCAT(first_name, " ", last_name)`]);
            managers.push("NULL"); // add "NULL" option
            resolve(managers);
        });
    });
}


const startMenu = [
    {
        type: "list",
        name: "startOptions",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Quit"
        ]
    }
]

const departmentPrompt = [
    {
        type: "input",
        name: "department",
        message: "What is the name of the department?",
    }
]

const rolePrompt = [
    {
        type: "input",
        name: "role",
        message: "What is the name of the role?",
    },
    {
        type: "list",
        name: "roleDepartment",
        message: "Which department does the role belong to?",

        // awaiting for promise of the function to resolve before returning the array
        choices: async () => await currentDepartments(),
    },
    {
        type: "input",
        name: "roleSalary",
        message: "What is the salary of the role?",
    }
]

const addEmployeePrompt = [
    {
        type: "input",
        name: "firstName",
        message: "What is employee's first name?",
    },
    {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
    },
    {
        type: "list",
        name: "employeeRole",
        message: "What is the employee's role?",
        choices: async () => await currentRoles(),
    },
    {
        type: "list",
        name: "employeeManager",
        message: "Who is the employee manager?",
        choices: async () => await currentManagers(),
        default: "NULL", // set default to "NULL"
    },
]

const updateEmployeePrompt = [
    {
        type: "list",
        name: "employeeList",
        message: "Which employee's role do you want to update?",
        choices: async () => await currentManagers(),
    },
    {
        type: "list",
        name: "newRole",
        message: "Which role do you want to assign the selected employee?",
        choices: async () => await currentRoles(),
    }
]


module.exports = { startMenu, departmentPrompt, rolePrompt, addEmployeePrompt, updateEmployeePrompt };