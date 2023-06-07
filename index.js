const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000 

app.use(cors())
app.use(express.json())

let verifyJWT = (req, res, next)=>{
  let authorization = req.headers.authorization;
  if (!authorization){
    return res.status(401).send({error: true, message : "unauthorized access" });
  }
  let token = authorization.split(' ')[1];

  jwt.verify(token, process.env.WEB_TOKEN, (err, decoded)=>{
    if (err){
      return res.status(403).send({error: true, message : "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_U}:${process.env.DB_P}@cluster0.rohhp7w.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {


    let userCollection = client.db('Athlete_Escapes').collection('users');

    
    // Verify APIS

    let verifyAdmin = async (req, res, next)=>{
      let email = req.decoded.email
      // console.log(email);
      let query = { email : email}
      let user = await userCollection.findOne(query);
      if(user?.role != 'admin'){
        return res.status(403).send({err: true, msg: 'forbidden'})
      }
      next();
    }

    app.get('/isAdmin/:email', async (req, res)=>{
      let mail = req.params.email;
      let filter = {email : mail}
      let user = await userCollection.findOne(filter);
      let result = { isAdmin : user?.role == 'admin'}
      res.send(result);
    })
    
    //JWT APIS



    app.post('/jwt', (req, res)=>{
      // console.log('hit jwt');
      let user = req.body;
      let token = jwt.sign(user, process.env.WEB_TOKEN, {expiresIn: '1h'} )
      res.send({token})

    })

    // Users APIS

    app.post('/users', async (req, res)=>{
      let user = req.body;
      let query = {email : user.email};
      let oldUser = await userCollection.findOne(query);
      if(oldUser){
        return
      }
      let result = await userCollection.insertOne(user);
      res.send(result);
      
    })

    app.get('/users', verifyJWT,verifyAdmin, async (req, res)=>{
      let result = await userCollection.find().toArray();
      res.send(result)
    })

    app.put('/users/a/:id', async (req, res)=>{
      let id = req.params.id;
      // console.log(id);
      let filter = { _id : new ObjectId(id)};
      let updateRole = {
        $set: {
          role : 'admin'
        }
      }
      let result = await userCollection.updateOne(filter, updateRole);
      res.send(result);

    })
    app.put('/users/s/:id', async (req, res)=>{
      let id = req.params.id;
      // console.log(id);
      let filter = { _id : new ObjectId(id)};
      let updateRole = {
        $set: {
          role : 'student'
        }
      }
      let result = await userCollection.updateOne(filter, updateRole);
      res.send(result);

    })
    app.put('/users/i/:id', async (req, res)=>{
      let id = req.params.id;
      // console.log(id);
      let filter = { _id : new ObjectId(id)};
      let updateRole = {
        $set: {
          role : 'instructor'
        }
      }
      let result = await userCollection.updateOne(filter, updateRole);
      res.send(result);

    })

    app.get('/instructors', async (req, res)=>{
        let filter = { role : 'instructor'}
        let result = await userCollection.find(filter).toArray()
        res.send(result)
    })


    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})