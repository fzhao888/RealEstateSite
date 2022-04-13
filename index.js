const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000

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

app.get('/',(req,res) => {
        console.log('Accept: ' + req.get('Accept'))

        pool.query('SELECT VERSION()', (err,version_results) => {
            console.log(err, version_results.rows)
            
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
})


app.get('/users', (req, res) => {
	res.json(users)
})


app.post('/', (req, res) => {  
	if(req.body.action && req.body.action == 'add'){
	pool.query(`INSERT INTO property (propertyType, price, size, num_bedroom, num_bathroom,addressID) VALUES ('${req.body.propertytype}', '${req.body.price}','${req.body.size}','${req.body.num_bedroom}','${req.body.num_bathroom}','${req.body.addressID}')` , (err, result) => {
	console.log(err, result)

	res.redirect('/')
	
	})
	}
	if(req.body.action && req.body.action == 'update'){
		//pool.query(`DELETE FROM property WHERE addressID = '{$req.body.addressId}')`, (err,result) => {
	pool.query(`UPDATE property SET propertyType = '${req.body.propertytype}' WHERE addressID = '${req.body.addressID}'`, (err,result) => {
	console.log(err, result)

	res.redirect('/')
		
	})
}

if(req.body.action && req.body.action == 'delete'){
		//pool.query(`DELETE FROM property WHERE addressID = '{$req.body.addressId}')`, (err,result) => {
	pool.query(`DELETE FROM property WHERE addressID = '{$req.body.addressID}'`, (err,result) => {
	console.log(err, result)

	res.redirect('/')
		
	})
}
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

app.put('/', (req,res) => {  
	pool.query(`UPDATE property SET propertyType = '${req.body.propertytype}' WHERE addressID = '${req.body.addressID}'`, (err,result) => {
	console.log(err, result)

	res.redirect('/')
		
	})
})

app.delete('/', (req,res) => {
	pool.query(`DELETE FROM property WHERE addressID = '{$req.body.addressID}'`, (err,result) => {
	console.log(err, result)

	res.redirect('/')
		
	})
})

	

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
