const inquirer = require('inquirer');
const db = require('./helpers/connection');

const { startMenu, departmentPrompt, rolePrompt, addEmployeePrompt, updateEmployeePrompt } = require('./helpers/questions');

function init() {
    inquirer.prompt(startMenu).then(answers => {
    
        switch(answers.startOptions) {
            case  "View All Employees":
                viewEmployees();
                break;
            case  "Add Employee":
                addEmployees();
                break;
            case  "Update Employee Role":
                updateRole();
                break;
            case "View All Roles":
                viewRoles();
                break;
            case "Add Role":
                addRole();
                break;
            case "View All Departments":
                viewDepartments();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Quit":
                return;
        }
    })
}

function viewEmployees () {
    
    // Concat first_name and last_name for manager. Second employee table is under alias 'manager'
    db.query(`
    SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee 
    JOIN role ON role.id = employee.role_id 
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id
    ORDER BY employee.id ASC;
    `, function (err, results) {
        console.table(results);

        init();
    })
   
}

function addEmployees() {
    inquirer.prompt(addEmployeePrompt).then(answers => {
        
        // First query to retrieve the id of corresponding role using the user response
        db.query(`SELECT id FROM role WHERE title = "${answers.employeeRole}"`, function (err, roleResults) {
            if(err) throw err;
            
            // IF statement if user chooses NULL for manager
            if (answers.employeeManager === 'NULL') {

                // Second query place NULL as manager
                db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ("${answers.firstName}", "${answers.lastName}", "${roleResults[0].id}", NULL)`, function (err, managerResults) {
                    if(err) throw err;

                    console.log(`\n${answers.firstName} ${answers.lastName} added with a role of ${answers.employeeRole} with no current manager specified\n`);

                    init();
                });

            } else {
                // If user does not choose NULL, second query to get the manager id based on the selected manager name
                db.query(`SELECT id FROM employee WHERE CONCAT(first_name, ' ', last_name) = "${answers.employeeManager}"`, function (err, managerResults) {
                    if(err) throw err;
                    
                    // Insert the new employee into the database with the retrieved role and manager ids
                    db.query(`
                    INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES ("${answers.firstName}", "${answers.lastName}", "${roleResults[0].id}", "${managerResults[0].id}")
                    `
                    , function (err, res) {

                        console.log(`\n${answers.firstName} ${answers.lastName} added with a role of ${answers.employeeRole} and reports to manager ${answers.employeeManager}\n`);

                        if(err) throw err;
                        init();
                    });
                });
            }
        });

    })
}

function updateRole() {
    inquirer.prompt(updateEmployeePrompt).then(answers => {

        // First query to retrieve data of id from emplyoee table and title from role table. JOIN used to combine role_id in employee and id in role. Using WHERE to filter results to include rows with the user selection
        db.query(`
        SELECT employee.id, role.title 
        FROM employee 
        JOIN role ON employee.role_id = role.id
        WHERE CONCAT(employee.first_name, ' ', employee.last_name) = "${answers.employeeList}"
        `, function (err, result) {
            if(err) throw err;
            
            // Second query to retrieve data from id of role table. WHERE specifies we only want to include rows with a title that matches the role user selected
            db.query(`
            SELECT id
            FROM role
            WHERE title = "${answers.newRole}"
            `, function (err, roleResult) {
                if (err) throw err;
    
                // Third query to update employee table's role_id to specifiy an INT, and this INT references the 'role' table id to give us the matching result to change the employees role.
                db.query(`
                UPDATE employee
                set role_id = "${roleResult[0].id}"
                WHERE CONCAT(first_name, ' ', last_name) = "${answers.employeeList}"
                
                `, function (err, res) {

                    console.log(`\n${answers.employeeList}'s role updated to ${answers.newRole}\n`)

                    if(err) throw err;
                    init();
                });
            })
        });
    })
}

function viewRoles() {
    // Displays all the roles in a table with id, title, department, and salary

    db.query(`
    SELECT role.id, role.title, department.name AS department, role.salary 
    FROM role
    JOIN department ON role.department_id = department.id
    ORDER BY role.id ASC;
    `, function (err, results) {
        console.table(results);

        init();
    })
}

function addRole() {
    inquirer.prompt(rolePrompt).then(answers => {

        const roleDepartment = answers.roleDepartment;
     
        // need to figure a way to change it dynamically --> SELECT department table and match user answer to department name to return the corresponding ID.
        function roleDepartmentID(roleDepartment) {
            switch(roleDepartment) {
                case "Sales":
                    return 1;
                case "Engineering":
                    return 2;
                case "Finance":
                    return 3;
                case "Legal":
                    return 4;
                default:
                    return 5;
            }
        }

        db.query(`
        INSERT INTO role (title, department_id, salary)
        VALUES ("${answers.role}", ${roleDepartmentID(roleDepartment)}, "${answers.roleSalary}")
        `, function (err, results) {
            if(err) throw err;

            console.log(`\n${answers.role} added to list of roles in the ${roleDepartment} department with a salary of ${answers.roleSalary}.\n`)
            init();
        })
        
    })


}

function viewDepartments() {
    // Insert table showing department names and ids
    db.query('SELECT * FROM department', function (err, results) {
        console.table(results);

        init();
    })
}

function addDepartment() {
    inquirer.prompt(departmentPrompt).then(answers => {

        db.query(`
        INSERT INTO department (name)
        VALUES ("${answers.department}")
        `, function (err, results) {
          if(err) throw err;

          console.log(`\n${answers.department} added to list of departments.\n`)
            init();
        
        })
    })
}



init();