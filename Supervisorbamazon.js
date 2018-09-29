var mysql = require('mysql');
var prompt = require('prompt');
var colors = require('colors/safe');
var Table = require('cli-table');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'Bamazon', 
});

var newDept = [];


connection.connect();

//creat the question that will be prompted to the user
var executiveOptions = {
	properties:{
		eOptions:{
			description: colors.cyan('Key in one of the following options: \n1) View Product Sales by Department \n2) Create New Department')
		},
	},
};

prompt.start();

//get the information responded by the user from the prompt
prompt.get(executiveOptions, function(err, res){
	//explain what should be done based on what the user answered to the prompt
	if(res.eOptions == 1){
		viewProductSales();
	} else if(res.eOptions == 2){
		createDepartment();
	} else{
		console.log('You picked an invalid choice!');
		connection.end();
	}
});

//function to be run when the user picks option 1
var viewProductSales = function(){
	//create a table for the data to be displayed in node
	var table = new Table({
		head: ['Department ID', 'Department Name', 'Overhead Cost', 'Total Sales', 'Total Profit'],
		style: {
			head:['blue'],
			compact: false,
			colAligns: ['center'],
		}
	});
	console.log(' ');
	console.log(colors.black.bgWhite.underline('Product Sales by Department'));

	//connect to the database and calculate total profits
	connection.query('SELECT * FROM totalprofits', function(err, res){
		if(err) console.log('Error: ' + err);

		//loop through the data from the totalprofits database and push it into the table
		for(var i = 0; i<res.length; i++){
			table.push(
				[res[i].DepartmentId, res[i].DepartmentName, res[i].OverHeadCosts, res[i].TotalSales, res[i].TotalProfit]
				);
		}

		console.log(' ');
		console.log(table.toString());
		connection.end();
	});
};

//creates the function to be run when the user selects option 2
var createDepartment = function(){

	//variable to add a new department to database
	var newDepartment = {
		properties: {
			newDeptName:{ description: colors.cyan('Please enter the name of the new department you would like to add.')
			},
			newOverhead:{ description: colors.yellow('What are the overhead costs for this department?')
			},
		}
	};

	prompt.start();
	//get the information the user enters for the prompts
	prompt.get(newDepartment, function(err, res){

		//variable to store the user responses
		var newDeptInfo = {
			deptName: res.newDeptName,
			overHeadNew: res.newOverhead,
			autoTotalSales: 0,
		};
		//push user responses to the array newDeptInfo
		newDept.push(newDeptInfo);
		//connect to the database Departments and insert the info received from the user into the database to create a new department
		connection.query('INSERT INTO Departments (DepartmentName, OverHeadCosts, TotalSales) VALUES (?, ?, ?);', [newDept[0].deptName, newDept[0].overHeadNew, newDept[0].autoTotalSales], function(err, result){
			if(err){
				console.log('Error: ' + err);
				connection.end();
			} else {
				console.log('');
				console.log(colors.magenta.underline('New Department sucessfully created!'));
				console.log(' ');
				connection.end();
			}
		});
	});
};