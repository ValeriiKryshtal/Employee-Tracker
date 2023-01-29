import cTable from 'console.table';
import {config} from './config.js';
import mySql from 'mysql2/promise';
import inquirer from 'inquirer';
import {showAllDept, showAllRol, showFullRoles, showEmplManager} from './seeds.js';
const conn = await mySql.createConnection(config);                              // creating connection with mySQL
const [fullDep] = await conn.execute(showAllDept);                              // update data from DB
const [fullRole] = await conn.execute(showFullRoles); 
const [fullEmpl] = await conn.execute(showEmplManager);
const [deptShow] = await conn.query(showAllDept);
function answerTheQuestion () {
     console.log('=================================')
     console.log('=            Employee           =')
     console.log('=             Tracker           =')
     console.log('=================================')
     return inquirer.prompt ([
          {
               type: 'list',
               name: 'action',
               message: "What would you like to do?",
               choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
          }])
               .then(async function (action) {
                    if (action.action === 'View all departments') {             // function to see all departments
                         console.table(fullDep)
                         answerTheQuestion ()
                    } else if (action.action === 'View all roles') {            // function to see all roles
                         console.table(fullRole);
                         answerTheQuestion ()
                    } else if (action.action === 'View all employees') {        // function to see all employees
                         console.table(fullEmpl);
                         answerTheQuestion ()
                    } else if (action.action === 'Add a department') {          // function to add new departments
                         return inquirer.prompt ([
                              {
                                   type: 'input',
                                   name: 'department',
                                   message: "Please enter name for the department"
                              }
                         ])
                         .then(async function (answer) {
                              const [addDept] = await conn.execute(`insert into department(department) values ('${answer.department}');`)
                              const [fullDep] = await conn.execute(showAllDept); 
                              console.table(fullDep);
                              answerTheQuestion();
                         })
                         
                    } else if (action.action === 'Add a role') {                // function to add new role
                              const departmentChoices = deptShow.map(({ department_id, department }) => ({
                                   value: department_id, name: `${department}`
                              }));
                         return inquirer.prompt ([
                              {
                                   type: 'input',
                                   name: 'title',
                                   message: "Please enter the role title"
                              },
                              {
                                   type: 'input',
                                   name: 'salary',
                                   message: "Please enter the salary for the role"
                              },
                              {
                                   type: 'list',
                                   name: 'department_id',
                                   message: "What department would be for this role?",
                                   choices: departmentChoices
                              }
                         ])
                         .then(async function (answer) {
                              const [addRole] = await conn.execute(`insert into role(title, salary, department_id) values ('${answer.title}', ${answer.salary}, ${answer.department_id});`)
                              const [fullRole] = await conn.execute(showFullRoles); 
                              console.table(fullRole);
                              answerTheQuestion();
                         })
                    } else if (action.action === 'Add an employee'){            // function to add new employee
                         const conn = await mySql.createConnection(config);
                         const [getFullRoll] = await conn.query(showAllRol);
                         const rolesChoices = getFullRoll.map(({ role_id, title }) => ({
                              value: role_id, name: `${title}`
                         }));
                         const managerChoices = fullEmpl.map(({ employee_id, first_name, last_name }) => ({
                              value: employee_id, name: `${first_name} ${last_name}`
                         }));
                         return inquirer.prompt ([
                              {
                                   type: 'input',
                                   name: 'first_name',
                                   message: "Please enter first name for the new employee"
                              },
                              {
                                   type: 'input',
                                   name: 'last_name',
                                   message: "Please enter last name for the new employee"
                              },
                              {
                                   type: 'list',
                                   name: 'role_id',
                                   message: "What role would be for this employee?",
                                   choices: rolesChoices
                              },
                              {
                                   type: 'list',
                                   name: 'manager_id',
                                   message: "Who is the manager for this employee?",
                                   choices: managerChoices
                              }
                         ])
                         .then(async function (answer) {
                              const [addEmpl] = await conn.execute(`insert into employee (first_name, last_name, role_id, manager_id) values ('${answer.first_name}', '${answer.last_name}', '${answer.role_id}', ${answer.manager_id});`)
                              const [fullEmpl] = await conn.execute(showEmplManager); 
                              console.table(fullEmpl);
                              answerTheQuestion();
                         })
                    }else if (action.action === 'Update an employee role'){     // function to update an employee role
                         // const updateRole = 'UPDATE employee SET role_id=${} where employee_id=${}'
                         const conn = await mySql.createConnection(config);
                         const [getFullRoll] = await conn.query(showAllRol);
                         // const [roleUpdate] = await conn.query(updateRole);
                         // const [fullEmpl] = await conn.execute(showEmplManager); 
                         const [getFullEmpl] = await conn.execute(showEmplManager); 
                         const rolesChoices = getFullRoll.map(({ role_id, title }) => ({
                              value: role_id, name: `${title}`
                         }));
                         const managerChoices = getFullEmpl.map(({ employee_id, first_name, last_name }) => ({
                              value: employee_id, name: `${first_name} ${last_name}`
                         }));
                         return inquirer.prompt ([
                              {
                                   type: 'list',
                                   name: 'employee_id',
                                   message: "Which employee you want to change role?",
                                   choices: managerChoices
                              },
                              {
                                   type: 'list',
                                   name: 'role_id',
                                   message: "What role would be for this employee?",
                                   choices: rolesChoices
                              }
                         ]).then (async function (answer){
                              const updateRole = `UPDATE employee SET role_id=${answer.role_id} where employee_id=${answer.employee_id}`
                              const [roleUpdate] = await conn.query(updateRole);
                              const [getFullEmpl] = await conn.execute(showEmplManager); 
                              console.table(getFullEmpl);
                              answerTheQuestion();
                         })
                    }
               })
};
answerTheQuestion();