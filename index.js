const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000

//Set the view engine for the express app
app.set("view engine", "jade")

//for parsing application/json
app.use(bodyParser.json());

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

app.post('/', (req, res) => {
	pool.query(`INSERT INTO property (propertyType, price, size, num_bedroom, num_bathroom) VALUES ('${req.body.propertyType}', '${req.body.price}','${req.body.size}','${req.body.num_bedroom}','${req.body.num_bathroom}')` , (err, result) => {

	console.log(err, result)

	res.redirect('/')
	
	})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
