const express = require('express')
const cors = require('cors')
const app =express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const cookieParser = require( 'cookie-parser')


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASS}@cluster0.cgsbnjt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const port = process.env.port || 5000;
 
app.use(cors({
  origin: [
    "http://localhost:5000",
    "https://doctor-f8ea2.web.app",
    "https://doctor-f8ea2.firebaseapp.com"
  ],
  credentials: true
}))
app.use(cookieParser())
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

const loger = (req,res,next)=>{
  console.log('cald',req.method,req.url)
 
  next()
}
const verify = (req,res,nex)=>{
  const token = req?.cookies?.token;
  console.log('token midle ware',token)
  if(!token){
    return res.status(401).send({message: 'unauthoried access'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN,(error,decode)=>{
    if(error){
      return res.status(401).send({message: 'unathorized access'})
    }
    req.user = decode
  })
  nex()

}
const cookieOption = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV ==='Production'? 'none': 'strict',
  secure: process.env.NODE_ENV ==='Production'? true: 'strict',
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
      const db = client.db('Doctor').collection('service')
      const order = client.db('ServiceData').collection('Order')
      
      app.get('/service',loger,async(req,res)=>{
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

    app.post('/booking',loger,async(req,res)=>{
      const booking = req.body;
      console.log(booking)
      const result = await order.insertOne(booking)
      res.send(result)
    })

    app.get('/book',loger,verify,async (req,res)=>{
        console.log(req.query.email)
        console.log('token owner', req.user)
        if(req.user.email!==req.query.email){
        return  res.status(403).send({message:'forbiden access'})
        }
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
    app.patch('/bookings/:id',loger,async(req,res)=>{
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

    app.post('/jwt',async (req,res)=>{
      const id = req.body
      
      const token = jwt.sign(id,process.env.ACCESS_TOKEN, {expiresIn: '1h' })
      
      console.log(token)
      res.cookie('token',token,{
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      
      res.send({success: true})
    })


  
    // await client.db("admin").command({ ping: 1 });
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