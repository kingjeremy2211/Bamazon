var mysql = require('mysql');
var prompt = require('prompt');
var colors = require('colors/safe');
var Table = require('cli-table');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'bamazon', 
});

var productPurchased = [];

//connect to the mysql database
connection.connect();

//pull the information from the Products database to display to the user
connection.query('SELECT ItemID, ProductName, Price FROM Products', function(err, result){
	if(err) console.log(err);

	//create a table for the information from the mysql database
	var table = new Table({
		head: ['Item Id#', 'Product Name', 'Price'],
		style: {
			head: ['yellow'],
			compact: false,
			colAligns: ['center'],
		}
	});

	//loop through each item in the mysql database and push info into new row in the table
	for(var i = 0; i < result.length; i++){
		table.push(
			[result[i].ItemID, result[i].ProductName, result[i].Price]
		);
	}
	console.log(table.toString());

	purchase();
});

//purchase function so the user can purchase one or more items listed in table
var purchase = function(){

	//create the questions that will be prompted to the user
	var productInfo = {
		properties: {
			itemID:{description: colors.yellow('Please enter the ID # of the item you wish to purchase')},
			Quantity:{description: colors.green('How many items would you like to purchase?')}
		},
	};

	prompt.start();

	//get the responses to the prompts above
	prompt.get(productInfo, function(err, res){

		//place these responses in the variable custPurchase
		var custPurchase = {
			itemID: res.itemID,
			Quantity: res.Quantity
		};
		
		//push variable from above to the productPurchased array
		productPurchased.push(custPurchase);

		//select the item the user selected above based on the item id number entered
		connection.query('SELECT * FROM Products WHERE ItemID=?', productPurchased[0].itemID, function(err, res){
				if(err) console.log(err, 'That item ID does not exist');
				
				//if the quantity available is less than the amount that the user wants to purchase,alert user that the product is sold out
				if(res[0].StockQuantity < productPurchased[0].Quantity){
					console.log('That product is sold out!');
					connection.end();

				//otherwise if the stock amount available is more than or equal to the amount asked for, the purchase is continued, alert user what items being purchased, how much one item is and what the total amount is
				} else if(res[0].StockQuantity >= productPurchased[0].Quantity){

					console.log('');

					console.log(productPurchased[0].Quantity + ' items purchased');

					console.log(res[0].ProductName + ' ' + res[0].Price);

					//variable for SaleTotal 
					var saleTotal = res[0].Price * productPurchased[0].Quantity;

					//update Departments saleTotal for the id of the item purchased
					connection.query("UPDATE Departments SET TotalSales = ? WHERE DepartmentName = ?;", [saleTotal, res[0].DepartmentName], function(err, resultOne){
						if(err) console.log('error: ' + err);
						return resultOne;
					});

					console.log('Total: ' + saleTotal);

					//variable for newly updated quantity of item(s) purchase
					newQuantity = res[0].StockQuantity - productPurchased[0].Quantity;
			
					//update the quantity for the item puchased
					connection.query("UPDATE Products SET StockQuantity = " + newQuantity +" WHERE ItemID = " + productPurchased[0].itemID, function(err, res){
						
						console.log('');

						console.log(colors.cyan('Congrats on your new car.  Thank you for shopping with us!'));
						
						console.log('');

						connection.end();
					});

				}

		});
	});

};