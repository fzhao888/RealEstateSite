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
	ssl: { rejectedUnauthorized: false }
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
            
         pool.query('SELECT * FROM team_members', (err,team_members_results) => {
            console.log(err, team_members_results)
         
            res.render('index', { 
                      teamNumber: 1,
 		      databaseVersion: version_results.rows[0].version,
		      teamMembers: team_members_results.rows
			})
          
           console.log('Content-Type: ' + res.get('Content-Type'))
		})
        })
})

app.post('/', (req, res) => {
	pool.query(`INSERT INTO team_members (first_name, last_name) VALUES ('${req.body.first_name}', '${req.body.last_name}')` , (err, result) => {

	console.log(err, result)

	res.redirect('/')
	
	})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
