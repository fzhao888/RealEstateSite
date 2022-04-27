const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000
const router = express.Router();
const path = require('path') 

//Set the view engine for the express app  
app.set("view engine", "jade")
var current_username = "";
var current_realtorID = -1;
var realtor = true;

//for parsing application/json
app.use(bodyParser.json());
app.use(express.json())

const users = []
//for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended:true }));
//form-urlencoded

//Database
const Pool = require('pg').Pool

var connectionParams =  null;
if (process.env.DATABASE_URL != null){
    connectionParams = {
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false }
    } 
}

else{
   connectionParams = {
   	user: 'team3_user',
   	host: 'localhost',
  	database: 'team3',
  	password: 'team3pass',
  	port: 5432
  }
}

console.log(connectionParams)
const pool = new Pool(connectionParams)
 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Willow' });
});
	
router.get('/users', (req, res) => {
	res.json(users)
}) 

router.post('/users' , async (req,res) => {
	try{
		const myPassword = await bcrypt.has(req.body.password,10);
		const user = { name: req.body.name, password: myPassword}
		users.push(user)
		res.status(201).send()
	} catch{
		res.status(500).send()
	}

})

router.post('/users/login', async(req,res) => {
	const user = users.find(user => user.name  === req.body.name)
	if(user == null){
		return res.status(400).send('Cannot find user')
		
	}try{
		if(await bcrypt.compare(req.body.password,user.password)){
			res.send('Success')
		}else{
			res.send('Not Allowed')
		}
	}catch{
		res.status(500).send()
		
	}
	
}) 

router.get('/insert', (req,res) => {
	
	pool.query(`SELECT * FROM property`, (err,property_results) => {
            console.log(err, property_results)
         
            res.render('insert', { 
                      teamNumber: 3, 
		      properties: property_results.rows
			});
			
	
	});
})

router.get('/register', (req,res) => { 
	res.render('register')
}) 

router.post('/register', (req,res) => {
	if(req.body.action && req.body.action == 'customer'){
		realtor = false;
		res.redirect('/customersignup') 
		
	}
	if(req.body.action && req.body.action == 'realtor'){
		realtor = true;
		res.redirect('/realtorsignup')
	}
})


router.get('/customersignup', (req,res) => {
	res.render('customersignup')

})

router.post('/customersignup' , (req,res) => {
	
	pool.query(`INSERT INTO customer(user_name,password,first_name,last_name,phone_number,email)
		VALUES ( '${req.body.username}', '${req.body.password}', '${req.body.firstName}', '${req.body.lastName}', '${req.body.phoneno}', '${req.body.email}' ) 
	 `, (err, result) => {
		 current_username = req.body.username;
		res.redirect('/customerpanel')
		
		} ); 
	
})

router.get('/realtorsignup', (req,res) => {
	res.render('realtorsignup')
	
})

router.post('/realtorsignup', (req,res) => {
	pool.query(`INSERT INTO realtor(realtorID, user_name,password, agency, first_name,last_name,phone_number,email)
		VALUES ( '${req.body.realtorID}' ,'${req.body.username}', '${req.body.password}', '${req.body.agency}','${req.body.firstName}', '${req.body.lastName}', '${req.body.phoneno}', '${req.body.email}' ) 
	 `, (err, result) => {
		 current_realtorID = req.body.realtorID;
		 current_username = req.body.username;
		res.redirect('/realtorpanel')
		
		} ); 
	
	
})

router.get('/invalid', (req,res) => {
	res.render('invalidlogin')
	
})

router.post('/invalid', (req,res) => { 
	res.redirect('/')
	
})

router.post('/login', (req,res) => { 

//check user name and password with db
	if(req.body.action && req.body.action == 'login'){
		if((req.body.username === '1') && (req.body.password ==='1')){   
			current_username = req.body.username;
			//create tables 
						
pool.query(`CREATE TABLE IF NOT EXISTS address ( addressID SERIAL PRIMARY KEY,
					 street VARCHAR(50),
					 city VARCHAR(30),
					 state VARCHAR(30),
					  zip NUMERIC(6)
					 );`, (err,result) => {
				console.log(err,result)
				});
				
				


pool.query(`CREATE TABLE IF NOT EXISTS realtor (
					realtorID INTEGER PRIMARY KEY, 
					 user_name VARCHAR(50),
					 password VARCHAR(50),
					 agency VARCHAR(30),
					 first_name VARCHAR(30),
					 last_name VARCHAR(30),
					 phone_number VARCHAR(20),
					 email VARCHAR(30)
					 );`, (err,result) => {
				console.log(err,result)
				});
					 

pool.query(`CREATE TABLE IF NOT EXISTS property (propertyID SERIAL PRIMARY KEY, 
					   propertyType VARCHAR(30),
					   price	 NUMERIC(30,2) CHECK( price > 0),
					   size INTEGER,
					   num_bedroom INTEGER CHECK (num_bedroom > 0),
					   num_bathroom INTEGER CHECK (num_bathroom > 0),
					   realtorID INTEGER REFERENCES realtor(realtorID),
					   addressID INTEGER REFERENCES address(addressID)
					  );`, (err,result) => {
				console.log(err,result)
				});
					 
pool.query(`CREATE TABLE IF NOT EXISTS customer (
					 user_name VARCHAR(50) PRIMARY KEY,
					 password VARCHAR(50),
					 first_name VARCHAR(30),
					 last_name VARCHAR(30),
					 phone_number VARCHAR(20),
					 email VARCHAR(30) 
					  );` , (err,result) => {
				console.log(err,result)
				});
			res.redirect('/insert'); 
						   
	
	}else{
	
		res.redirect('/invalid');
		
		console.log(req)
	
		}
		
	} 
	
	if(req.body.action && req.body.action == 'register'){
		res.redirect('/register');
	}
	
 })



router.post('/insert', (req, res) => {  
	if(req.body.action && req.body.action == 'add'){
	pool.query(`INSERT INTO property (propertyType, price, size, num_bedroom, num_bathroom,addressID) VALUES ('${req.body.propertytype}', '${req.body.price}','${req.body.size}','${req.body.num_bedroom}','${req.body.num_bathroom}','${req.body.addressID}')` , (err, result) => {
	console.log(err, result)

	res.redirect('/insert')
	
		})
	}
	
	if(req.body.action && req.body.action == 'update'){ 
	pool.query(`UPDATE property SET propertyType = '${req.body.propertytype}', price = '${req.body.price}', size='${req.body.size}', num_bedroom = '${req.body.num_bedroom}', num_bathroom = '${req.body.num_bathroom}' WHERE addressID = '${req.body.addressID}'`, (err,result) => {
	console.log(err, result)

	res.redirect('/insert')
		
	})
}

	if(req.body.action && req.body.action == 'delete'){ 
		pool.query(`DELETE FROM property WHERE addressID = '${req.body.addressID}'`, (err,result) => { 
		console.log(err, result) 
		
		res.redirect('/insert')
		
		})
	}
})

router.post('/users', (req, res) => {
	const user = { name: req.body.name, password: req.body.password }
	users.push(user)
	res.status(201).send()
})

router.post('/users/login',(req,res) => {
	const user = users.find(user => user.name = req.body.name)
	if (user == null) {
		return res.status(400).send('Cannot find user')
	}
})

 
router.get('/realtorpanel', (req,res) => { 
            res.render('realtorpanel', {name: current_username});
			 
	 
 })

app.use('/',router);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
