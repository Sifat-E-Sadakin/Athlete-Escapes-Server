const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 3000 

app.use(cors())
app.use(express.json())


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

    app.get('/users', async (req, res)=>{
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