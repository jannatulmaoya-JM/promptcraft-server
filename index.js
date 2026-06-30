(async () => {
  const jose = await import('jose');
const express = require('express');
const dontenv = require("dotenv");
const cors = require("cors");
const { createRemoteJWKSet,jwtVerify } = require('jose');
const { MongoClient, ServerApiVersion } = require('mongodb');

dontenv.config();

const app = express();
const port = process.env.PORT ;
const uri = process.env.DB_URI;

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
  }),
);
app.use(express.json());


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const varifyToken = async(req,res,next) =>{
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const token = authHeader.split(" ") [1]
  if (!token){
     return res. status (401).json ({ msg: "Unauthorized"});
  }

  try {
    const {payload} = await jwtVerify(token, JWKS)
     req.user = payload
     next();
  } catch (error){
      console.log(error)
       return res. status (401).json ({ msg: "Unauthorized"});
  }
}
async function server() {
  try {
   
    //await client.connect();
    const db = client.db("Prompt-Craft");
    const userCollection = db.collection("user");
    const promptCollection = db.collection("Prompts");
    const reviewCollection = db.collection("reviews"); 

    app.post('/api/prompts', varifyToken, async (req, res) => {
      const newPrompt = req.body;
      const result = await promptCollection.insertOne(newPrompt);
      res.send(result);
    });
     
    
    app.get('/api/prompts', async (req, res) => {
    try {
       
        const { category, engine, difficulty, sort, search, page = 1 } = req.query;
        const limit = 10; 
        const skip = (parseInt(page) - 1) * limit;

        let query = {};
        if (category && category !== "All") query.category = category;
        if (engine && engine !== "All") query.aiEngine = engine;
        if (difficulty && difficulty !== "All") query.level = difficulty;
        if (search) query.title = { $regex: search, $options: 'i' };

        let sortOption = {};
        if (sort === "Latest") sortOption = { date: -1 };
        else if (sort === "Most Popular") sortOption = { views: -1 };
        else if (sort === "Most Copied") sortOption = { copies: -1 };

        const totalPrompts = await promptCollection.countDocuments(query);

        const prompts = await promptCollection.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .toArray();
            
      
        res.json({ 
            data: prompts, 
            totalPages: Math.ceil(totalPrompts / 10),
            currentPage: parseInt(page)
        });
         } catch (err) {
           res.status(500).json({ message: "Failed to fetch prompts", error: err });
          }
    });
  


app.get('/api/prompts/popular', async (req, res) => {
    try {
     
        const popularPrompts = await promptCollection
            .find({})
            .sort({ views: -1 })
            .limit(6)           
            .toArray();
            
        res.json({ data: popularPrompts });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch popular prompts", error: err });
    }
});

    

    const { ObjectId } = require('mongodb');
         
         app.get('/api/prompts/:id', async (req, res) => {
             try {
                 const id = req.params.id;
                 const prompt = await promptCollection.findOne({ _id: new ObjectId(id) });
                 res.json(prompt);
             } catch (err) {
                 res.status(500).json({ message: "Error fetching prompt" });
             }
    });

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await reviewCollection.find({}).toArray();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews", error: err });
  }
});

app.get('/api/reviews/populer', async (req, res) => {
  try {

  
    const reviews = await reviewCollection.find({}).limit(4).toArray(); 
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews", error: err });
  }
});

  
   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
server().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on  ${port} PORT`);
});

})();
