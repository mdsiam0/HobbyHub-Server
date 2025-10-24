require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v1r7xwf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const groupCollection = client.db("groupsDB").collection("groups");

  
    app.get("/groups", async (req, res) => {
      const emailFilter = req.query.email;
      const query = emailFilter ? { userEmail: emailFilter } : {};
      const groups = await groupCollection.find(query).toArray();
      res.send(groups);
    });

  
    app.get("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const group = await groupCollection.findOne({ _id: new ObjectId(id) });
      res.send(group);
    });

   
    app.post("/groups", async (req, res) => {
      const newGroup = req.body;
      const result = await groupCollection.insertOne(newGroup);
      res.send(result);
    });

   
    app.get("/featuredGroups", async (req, res) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const featuredGroups = await groupCollection
          .find({ startDate: { $gte: today } })
          .sort({ startDate: 1 })
          .limit(6)
          .toArray();

        res.status(200).json(featuredGroups);
      } catch (error) {
        console.error("Error fetching featured groups:", error);
        res.status(500).json({ error: "Failed to fetch featured groups" });
      }
    });

    
    app.put("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const updatedGroup = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: updatedGroup };

      try {
        const result = await groupCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Failed to update group:", error);
        res.status(500).send({ message: "Failed to update group" });
      }
    });

    
    app.delete("/groups/:id", async (req, res) => {
      const id = req.params.id;
      const result = await groupCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
