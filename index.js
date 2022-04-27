const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000
const router = express.Router();
const path = require('path') 
const pg = require('pg')

//Set location for accessing files
app.use(express.static(path.join(__dirname, 'public')));

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
const Pool = require('pg')

var connectionParams =  null;
if (process.env.DATABASE_URL != null){
    connectionParams = {
		connectionString: process.env.DATABASE_URL,
		ssl: { rejectUnauthorized: false }
    } 
}

else{
   connectionParams = {
	host: 'willowrealestate.postgres.database.azure.com',
    user: 'team5',
    password: 'Willow5!',
    database: 'postgres',
    port: 5432,
    ssl: true
  }
}

console.log(connectionParams)
const pool = new pg.Client(connectionParams)

pool.connect(err => {
    if (err) throw err;
    else {
        console.log("connection error")
    }
});
 
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
	res.render('/register')
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
 
router.get('/login' , (req,res) => {
	res.render('index')
	
})

router.post('/login' , (req,res) => {
	if(req.body.action && req.body.action == 'customer') {
		res.redirect('/customerlogin')
	}	
	if(req.body.action && req.body.action == 'realtor') {
		res.redirect('/realtorlogin')
	}	
	 
})


router.get('/customerlogin', (req,res) => {
	res.render('customerlogin')
	
})



router.post('/customerlogin', (req,res) => { 

//check user name and password with db
	if(req.body.action && req.body.action == 'login'){
		if((req.body.username === '2') && (req.body.password ==='2')){   
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
			res.redirect('/customerpanel'); 
						   
	
	}else{
	
		res.redirect('/invalid');
		
		console.log(req)
	
		}
		
	} 
	
	if(req.body.action && req.body.action == 'register'){
		res.redirect('/register');
	}
	
 })

router.get('/realtorlogin', (req,res) => {
	res.render('realtorlogin')
	
})



router.post('/realtorlogin', (req,res) => { 

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
			res.redirect('/realtorpanel'); 
						   
	
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
	
	pool.query(`SELECT * FROM realtor WHERE user_name = '${current_username}'`, (err,realtor_results) => {
            console.log(err, realtor_results)
         
            res.render('realtorpanel', { 
                     name: current_username,
                     realtors: realtor_results.rows
			});
			
	
	}); 
			 
	 
 })
 
 router.post('/realtorpanel', (req,res) => {
	 
	if(req.body.action && req.body.action == 'crud'){
		res.redirect('/insert')
	}
	
	if(req.body.action && req.body.action == 'change password'){
		res.redirect('/realtorchangepassword')
			
	}   
	
	if(req.body.action && req.body.action == 'change password'){
		res.redirect('/realtorchangephoneno')
			
	} 
	
	
	
	if(req.body.action && req.body.action == 'change email'){
		res.redirect('/realtorchangeemail')
			
	} 
	
		
	if(req.body.action && req.body.action == 'change agency'){
		res.redirect('/realtorchangeagency')
			
	} 
	
	if(req.body.action && req.body.action == 'change phone number'){
		res.redirect('/realtorchangephoneno')
			
	} 
	 
 })

router.get('/realtorchangeagency', (req,res) => {
	res.render('realtorchangeagency')

})

router.post('/realtorchangeagency' , (req,res) => {
	pool.query(`UPDATE realtor SET agency = '${req.body.agency}' WHERE user_name = '${current_username}' `  )
	res.redirect('/realtorpanel')
	 
})

router.get('/realtorchangepassword' , (req,res) => {
	res.render('realtorchangepassword')
})

router.post('/realtorchangepassword', (req,res) => {
	pool.query(`UPDATE realtor SET password = '${req.body.password}' WHERE user_name = '${current_username}' `  )
	res.redirect('/realtorpanel')
	
})


router.get('/realtorchangeemail', (req,res) => {
	res.render('realtorchangeemail')

})

router.post('/realtorchangeemail' , (req,res) => {
	pool.query(`UPDATE realtor SET email = '${req.body.email}' WHERE user_name = '${current_username}' `  )
	res.redirect('/realtorpanel')
	 
})

router.get('/realtorchangephoneno' , (req,res) => {
	res.render('realtorchangephoneno')
})

router.post('/realtorchangephoneno', (req,res) => {
	pool.query(`UPDATE realtor SET phone_number = '${req.body.phoneno}' WHERE user_name = '${current_username}' `  )
	res.redirect('/realtorpanel')
	
})



router.get('/customerpanel', (req,res) => { 
	
	pool.query(`SELECT * FROM customer WHERE user_name = '${current_username}'`, (err,customer_results) => {
            console.log(err, customer_results)
         
            res.render('customerpanel', { 
                     name: current_username,
                      customers: customer_results.rows
			});
			
	
	}); 
			 
	 
 })
 
 router.post('/customerpanel', (req,res) => {
	  
	if(req.body.action && req.body.action == 'change password'){
		res.redirect('/customerchangepassword')
			
	}   
	
	if(req.body.action && req.body.action == 'change password'){
		res.redirect('/customerchangephoneno')
			
	} 
	
	
	
	if(req.body.action && req.body.action == 'change email'){
		res.redirect('/customerchangeemail')
			
	} 
	 
	
	if(req.body.action && req.body.action == 'change phone number'){
		res.redirect('/customerchangephoneno')
			
	} 
	 
 }) 

router.get('/customerchangepassword' , (req,res) => {
	res.render('customerchangepassword')
})

router.post('/customerchangepassword', (req,res) => {
	pool.query(`UPDATE customer SET password = '${req.body.password}' WHERE user_name = '${current_username}' `  )
	res.redirect('/customerpanel')
	
})


router.get('/customerchangeemail', (req,res) => {
	res.render('customerchangeemail')

})

router.post('/customerchangeemail' , (req,res) => {
	pool.query(`UPDATE customer SET email = '${req.body.email}' WHERE user_name = '${current_username}' `  )
	res.redirect('/customerpanel')
	 
})

router.get('/customerchangephoneno' , (req,res) => {
	res.render('customerchangephoneno')
})

router.post('/customerchangephoneno', (req,res) => {
	pool.query(`UPDATE customer SET phone_number = '${req.body.phoneno}' WHERE user_name = '${current_username}' `  )
	res.redirect('/customerpanel')
	
})

app.use('/',router);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
