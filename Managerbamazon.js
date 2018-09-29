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

var inventoryUpdate = [];
var addedProduct = [];

connection.connect();

//create the prompt that will load when the app loads
var managerOptions = {
	properties:{
		mOptions:{
			description: colors.cyan('Key in one of the following options: 1) View Products for Sale 2) View Low Inventory 3) Add to Inventory 4) Add New Product')
		},
	},
};

//start the prompt
prompt.start();
//prompt the above question and below it state what will be done based on what number the user types
prompt.get(managerOptions, function(err, res){
	if(res.mOptions == 1){
		viewProducts();
	} else if(res.mOptions == 2){
		viewInventory();
	} else if(res.mOptions == 3){
		addInventory();
	} else if(res.mOptions == 4){
		addNewProduct();
	} else {
		console.log('You picked an invalid choice.');
		connection.end();
	}
});

//function for option 1 of the question above
var viewProducts = function(){
	//connect to the mysql database called products and return the info
	connection.query('SELECT * FROM Products', function(err, res){
		
		console.log('');
		
		console.log('Products for Sale');
		
		console.log('');	

		//create table to make data look organized
		var table = new Table({
			head: ['Item Id#', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
			style: {
				head: ['blue'],
				compact: false,
				colAligns: ['center'],
			}
		});

		//loop through the mysql database, for each item that is returned, push info to the table
		for(var i=0; i<res.length; i++){
			table.push(
				[res[i].ItemID, res[i].ProductName, res[i].DepartmentName, res[i].Price, res[i].StockQuantity]
			);
		}

		//display table and end connection to mysql
		console.log(table.toString());
		connection.end();
	});
};

//function for the second option from the prompt
var viewInventory = function(){

	//connect to the mysql database Products and only return items that have a quantity of less than 2
	connection.query('SELECT * FROM Products WHERE StockQuantity < 2', function(err, res){
		
		console.log('');
		
		console.log('Items With Low Inventory');
		
		console.log('');

		var table = new Table({
			head: ['Item Id#', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
			style: {
				head: ['blue'],
				compact: false,
				colAligns: ['center'],
			}
		});

		//loop through the data returned from mysql and push it into the table
		for(var i=0; i<res.length; i++){
			table.push(
				[res[i].ItemID, res[i].ProductName, res[i].DepartmentName, res[i].Price, res[i].StockQuantity]
			);
		}

		console.log(table.toString());
		connection.end();
	});
};

//function for the third option of the prompt
var addInventory = function(){
	//variable that will prompt the manager which item from the product list he/she would like to add
	var addInvt = {
		properties:{
			inventoryID: {
				description: colors.green('What is the ID number of the product you want to add inventory for?')
			},
			inventoryAmount:{
				description: colors.green('How many items do you want to add to the inventory?')
			}
		},
	};

	prompt.start();

	//get the information entered in response to the prompt above
	prompt.get(addInvt, function(err, res){

		//create a variable for the answers to the prompt questions
		var invtAdded = {
			inventoryAmount: res.inventoryAmount,
			inventoryID: res.inventoryID,
		};

		//push the responses to the inventoryUpdate array
		inventoryUpdate.push(invtAdded);

		//connect to the mysql database Products and sets the stock quanitity to the number entered in the prompt above + the current quantity for a specific item iD
		connection.query("UPDATE Products SET StockQuantity = (StockQuantity + ?) WHERE ItemID = ?;", [inventoryUpdate[0].inventoryAmount, inventoryUpdate[0].inventoryID], function(err, result){

			if(err) console.log('error '+ err);

			//then this selects the newly updated information from the mysql database so we can console.log a confirmation to the user with the updated stock amount
			connection.query("SELECT * FROM Products WHERE ItemID = ?", inventoryUpdate[0].inventoryID, function(error, resOne){
				
				console.log('');
				
				console.log('The new updated stock quantity for id# '+inventoryUpdate[0].inventoryID+ ' is ' + resOne[0].StockQuantity);
				
				console.log('');
				
				connection.end();
			});

		});
	});
};

//create the function for the last option above
var addNewProduct = function(){
	//variable for newProduct which contain the questions that are prompted to the user
	var newProduct = {
		properties: {
			newIdNum:{ description: colors.cyan('Please enter a unique 2 digit item Id #')},
			newItemName:{ description: colors.yellow('Please enter the name of the product you wish to add')},
			newItemDepartment: { description: colors.cyan('What department does this item belong in?')},
			newItemPrice: { description: colors.yellow('Please enter the price of the item in the format of 00000')},
			newStockQuantity: { description: colors.cyan('Please enter a stock quantity for this item')},
		}
	};

	prompt.start();

	//get the responses for the prompts
	prompt.get(newProduct, function(err, res){

		//create a variable for the responses to be logged to
		var newItem = {
			newIdNum: res.newIdNum,
			newItemName: res. newItemName,
			newItemDepartment: res.newItemDepartment,
			newItemPrice: res.newItemPrice,
			newStockQuantity: res.newStockQuantity,

		};

		//push the variable and the response data to the addedProduct array
		addedProduct.push(newItem);

		//connect to mysql and insert responses to the prompts into database to create new product(s)
		connection.query('INSERT INTO Products (ItemID, ProductName, DepartmentName, Price, StockQuantity) VALUES (?, ?, ?, ?, ?);', [addedProduct[0].newIdNum, addedProduct[0].newItemName, addedProduct[0].newItemDepartment, addedProduct[0].newItemPrice, addedProduct[0].newStockQuantity], function(err, result){

			if(err) console.log('Error: ' + err);

			console.log('New item successfully added to the inventory!');
			
			console.log(' ');
			
			console.log('Item id#: ' + addedProduct[0].newIdNum);
			
			console.log('Item name: ' + addedProduct[0].newItemName);
			
			console.log('Department: ' + addedProduct[0].newItemDepartment);
			
			console.log('Price: $' + addedProduct[0].newItemPrice);
			
			console.log('Stock Quantity: ' + addedProduct[0].newStockQuantity);

			connection.end();
		});
	});
};