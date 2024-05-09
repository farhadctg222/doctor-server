const express = require('express')
const cors = require('cors')
const app =express()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://doctor:MI6UlA1ARPCILMyX@cluster0.cgsbnjt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const port = process.env.port || 5000;
 
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('doctors is runng')
})




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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
      const db = client.db('Doctor').collection('service')
      const order = client.db('ServiceData').collection('Order')
      
      app.get('/service',async(req,res)=>{
        const curson = db.find()
        const data = await curson.toArray()
        res.send(data)

      });

      app.get('/service/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const option = {
            projection: {title: 1, price: 1,img:1}
        }
        const result  = await db.findOne(query,option)
        res.send(result)
      });

    app.post('/booking',async(req,res)=>{
      const booking = req.body;
      console.log(booking)
      const result = await order.insertOne(booking)
      res.send(result)
    })

    app.get('/book',async (req,res)=>{
        console.log(req.query.email)
        let query = {}
        if(req.query?.email){
          query = { email : req.query.email }
        }
        const result = await order.find(query).toArray()
        res.send(result)
    })

    app.delete('/bookings/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await order.deleteOne(query)
      res.send(result)
    }),
    app.patch('/bookings/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updateBooking = req.body;
      const update = {
        $set: {
          status: updateBooking.status
        }
      }
      console.log(updateBooking)
      const result = await order.updateOne(filter,update)
      res.send(result)
    })


  
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`doctor server is runnng  ${port}`)
})