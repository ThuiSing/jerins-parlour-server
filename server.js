const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
const app = express();
app.use(cors());
app.use(express.json());

// server

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cebya.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//connect
const run = async () => {
  try {
    await client.connect();
    // console.log("connected");
    const database = client.db("Jerins_Parlours");
    const usersCollection = database.collection("Users");

    //check admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      let isAdmin;
      if (result?.role === "admin") {
        isAdmin = true;
      } else {
        isAdmin = false;
      }
      res.json({ admin: isAdmin });
    });
    // add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //update or replace /add
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: user,
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close()
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("parlours server is running");
});
app.listen(port, () => {
  console.log("running port in ", port);
});
