const showAllDept = 'select * from department ORDER BY department_id ASC;' // view all departments, 
const showAllRol = 'select * from role ORDER BY role_id ASC;' // view all roles,
const showFullRoles = 'select role.role_id, role.title, role.salary, department.department from role inner join department on department.department_id=role.department_id'
const showEmplManager = `SELECT e.employee_id, e.first_name, e.last_name, r.title, d.department AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM employee e
LEFT JOIN role r
   ON e.role_id = r.role_id
LEFT JOIN department d
ON d.department_id = r.department_id
LEFT JOIN employee m
   ON m.employee_id = e.manager_id
ORDER BY employee_id ASC;`
export {showAllDept, showAllRol, showFullRoles, showEmplManager};