const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000
const router = express.Router();
const path = require('path') 

//Set the view engine for the express app 
app.set("view engine", "jade")

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

router.get('/', function(req,res) {
	res.sendFile(path.join(__dirname+'/index.html')); 
});

router.get('/insert', function(req, res) {
	res.sendFile(path.join(__dirname+'/insert.html')); 
});

	
app.get('/users', (req, res) => {
	res.json(users)
}) 

app.post('/users' , async (req,res) => {
	try{
		const myPassword = await bcrypt.has(req.body.password,10);
		const user = { name: req.body.name, password: myPassword}
		users.push(user)
		res.status(201).send()
	} catch{
		res.status(500).send()
	}

})

app.post('/users/login', async(req,res) => {
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

app.get('/main',(req,res) => {
        console.log('Accept: ' + req.get('Accept')) 
            
         pool.query('SELECT * FROM property', (err,property_results) => {
            console.log(err, property_results)
         
            res.render('index', { 
                      teamNumber: 3,
 		      databaseVersion: version_results.rows[0].version,
		      properties: property_results.rows
			})
          
           console.log('Content-Type: ' + res.get('Content-Type'))
		})
       }) 
       
app.post('/login', (req,res) => { 

//check user name and password with db
if((req.body.username === 'team3') && (req.body.password ==='team3pass')){
		/** res.send(`<html>
	 <head>
</head>
<body>
Hello ${req.body.username}!
</body>
</html>`) **/
	 //res.direct('/insert')
	 //res.sendFile(path.join(__dirname+'views/insert.jade')); 
	 res.redirect('/insert');
	 console.log(req)
	
}else{
	
	res.send('Invalid Login')  
	 console.log(req)
	
}

	 
 })


router.post('/insert', (req, res) => {   
	pool.query(`INSERT INTO property (propertyType, price, size, num_bedroom, num_bathroom,addressID) VALUES ('${req.body.propertytype}', '${req.body.price}','${req.body.size}','${req.body.num_bedroom}','${req.body.num_bathroom}','${req.body.address}')` , (err, result) => {
	console.log(err, result)

	res.redirect('/insert')
	
		})
	})
router.post('/delete', (req,res) => {
	pool.query(`DELETE FROM property WHERE addressID = '${req.body.addressID}'`, (err,result) => { 
		console.log(err, result) 
		res.redirect('/delete')
		
		})
	
})

router.post('/update', (req,res) => {
		pool.query(`UPDATE property SET propertyType = '${req.body.propertytype}', price = '${req.body.price}', size='${req.body.size}', num_bedroom = '${req.body.num_bedroom}', num_bathroom = '${req.body.num_bathroom}' WHERE address = '${req.body.address}'`, (err,result) => {
			console.log(err, result) 
			res.redirect('/update')
		})
	})



app.post('/users', (req, res) => {
	const user = { name: req.body.name, password: req.body.password }
	users.push(user)
	res.status(201).send()
})

app.post('/users/login',(req,res) => {
	const user = users.find(user => user.name = req.body.name)
	if (user == null) {
		return res.status(400).send('Cannot find user')
	}
})




/**

app.put('/', (req,res) => {  
	pool.query(`UPDATE property SET propertyType = '${req.body.propertytype}' WHERE addressID = '${req.body.addressID}'`, (err,result) => {
	console.log(err, result)

	res.redirect('/')
		
	})
})

app.delete('/', (req,res) => {
	pool.query(`DELETE FROM property WHERE addressID = '${req.body.addressID}'`, (err,result) => { 
	console.log(err, result)

	res.redirect('/')
		
	})
})
 **/

app.use('/',router);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
