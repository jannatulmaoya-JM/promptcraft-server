const express = require('express');
const dontenv = require("dotenv");
const cors = require("cors");

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


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});'/;.l,'

async function server() {
  try {
   
    await client.connect();
    const db = client.db("Prompt-Craft");
  
    const userCollection = db.collection("user");
    const promptCollection = db.collection("Prompts");
    

    app.post('/api/prompts', async (req, res) => {
      const newPrompt = req.body;
      const result = await promptCollection.insertOne(newPrompt);
      res.send(result);
    });
     
    app.get('/api/prompts', async (req, res) => {
        try {
          const prompts = await promptCollection.find({}).toArray();
          res.json({ data: prompts });
        } catch (err) {
          res.status(500).json({ message: "Failed to fetch prompts", error: err });
        }
    });

  
    await client.db("admin").command({ ping: 1 });
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