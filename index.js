const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000
const router = express.Router();
const path = require('path') 
const pg = require('pg')
const bcrypt = require('bcrypt')

//Set location for accessing files
app.use(express.static(path.join(__dirname, 'public')));

//Set the view engine for the express app  
app.set("view engine", "pug")
var current_username = "";
var current_realtorID = -1;
var realtor = true;

//for parsing application/json
app.use(bodyParser.json());
app.use(express.json())

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
const pool = new pg.Client(connectionParams)

pool.connect(err => {
    if (err) throw err; 
});
 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Willow' });
});
	
 

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


router.get('/customersignup',  (req,res) => {
	res.render('customersignup')

})

router.post('/customersignup' ,   async (req,res) => {
	
	
	if( !req.body.username || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.phoneno || !req.body.email){
		
		res.redirect('/customersignuperror')
	}else{
	 
	  const hp = await bcrypt.hash(req.body.password, 10)   
	 
	 pool.query(`INSERT INTO customer(user_name,password,first_name,last_name,phone_number,email)
		VALUES ( '${req.body.username}', '${hp}', '${req.body.firstName}', '${req.body.lastName}', '${req.body.phoneno}', '${req.body.email}' ) `, (err, result) => {
		 current_username = req.body.username; 
		 
		 res.redirect('/customerlogin')
		 
		 } );  
		
	}
	
})

router.get('/customersignuperror' , (req,res) => {
	res.render('customersignuperror')
	
})

router.post('/customersignuperror', (req,res) => {
	if( req.body.action && req.body.action == 'try again' ){ 
		  res.redirect('/customersignup')
	} 
})
	

router.get('/realtorsignup', (req,res) => {
	res.render('realtorsignup')
	
})

router.post('/realtorsignup', async (req,res) => {
	if( !req.body.realtorID || !req.body.username || !req.body.password || !req.body.agency || !req.body.firstName ||
	 !req.body.lastName || !req.body.phoneno || !req.body.email)  
	 
	 return res.redirect('/realtorsignuperror')
	
	const hp = await bcrypt.hash(req.body.password, 10)
	
	pool.query(`INSERT INTO realtor(realtorID, user_name,password, agency, first_name,last_name,phone_number,email)
		VALUES ( '${req.body.realtorID}' ,'${req.body.username}', '${hp}', '${req.body.agency}','${req.body.firstName}', '${req.body.lastName}', '${req.body.phoneno}', '${req.body.email}' ) 
	 `, (err, result) => {
		 current_realtorID = req.body.realtorID;
		 current_username = req.body.username;
		res.redirect('/realtorlogin')
		
		} ); 
	
	
})

router.get('/realtorsignuperror' , (req,res) => { 
	 res.render('realtorsignuperror')
}) 

router.post('/realtorsignuperror' , (req,res) => {
	if( req.body.action && req.body.action == 'try again' ){ 
		  res.redirect('/realtorsignup')
	} 
	
})

router.get('/invalid', (req,res) => {
	res.render('invalidlogin')
	
})

router.post('/invalid', (req,res) => { 
	if(realtor){
		res.redirect('/realtorlogin')
	}else{
		res.redirect('/customerlogin')
	}
	
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



router.post('/customerlogin',    (req,res) => { 
 
realtor = false
//check user name and password with db
	if(req.body.action && req.body.action == 'login'){
 		current_username = req.body.username;
			 pool.query(`SELECT * FROM CUSTOMER WHERE user_name = '${req.body.username}'`, (err,result) => {
				console.log(err,result) 
				
				if(result.rows.length == 0) {
					res.redirect('/nocustomer') 
				}
				if(result.rows.length > 0){
					var password = result.rows[0].password
					
					if(  bcrypt.compareSync(req.body.password, password) ){
						res.redirect('/customerpanel')
					}else{
						
						res.redirect('/invalid') 
						console.log(req)
				}
			}
				}); 
			}
	 
		 
	
	if(req.body.action && req.body.action == 'register'){
		res.redirect('/register');
	}
	
 })

router.get('/nocustomer' , (req,res) => {
	res.render('nocustomer')
})

router.post('/nocustomer' , (req,res) => {
	if(req.body.action && req.body.action == 'try again')
		res.redirect('/customerlogin')
	if(req.body.action && req.body.action == 'register')
		res.redirect('/customersignup')
	
	
})

router.get('/norealtor' , (req,res) => {
	res.render('norealtor')
})

router.post('/norealtor' , (req,res) => {
	if(req.body.action && req.body.action == 'try again')
		res.redirect('/realtorlogin')
	if(req.body.action && req.body.action == 'register')
		res.redirect('/realtorsignup')
	
	
})

router.get('/realtorlogin', (req,res) => {
	res.render('realtorlogin')
	
})


router.post('/realtorlogin', (req,res) => { 

realtor = true

//check user name and password with db
	if(req.body.action && req.body.action == 'login'){
		   
			current_username = req.body.username;
			 pool.query(`SELECT * FROM realtor WHERE user_name = '${req.body.username}'`, (err,result) => {
				console.log(err,result)
				
				if(result.rows.length == 0)
					res.redirect('/norealtor') 
				
				if(result.rows.length > 0){
					var password = result.rows[0].password
					
					if( bcrypt.compareSync(req.body.password, password) ){
						res.redirect('/realtorpanel')
					}else{
						 res.redirect('/invalid') 
						 console.log(req)
					}
				}
				
			})
				
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
 
router.get('/realtorpanel', (req,res) => {
	
	pool.query(`SELECT * FROM realtor WHERE user_name = '${current_username}'`, (err,realtor_results) => {
            console.log(err, realtor_results)
         
             res.render('realtorpanel', { 
                     name: current_username,
                      realtor: realtor_results.rows[0] 
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
                      customer: customer_results.rows[0] 
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
