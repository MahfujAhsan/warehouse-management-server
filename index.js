const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5500;

// MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.46ry8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const inventory = client.db('molinardInventory').collection('inventoryItems');

        app.get("/", async (req, res) => {
            await res.send("HeY Molinard Please Res");
        });


        app.get('/myItems', async(req, res) => {
            const email = req.query.email;
            const query = {name: email};
            const cursor = inventory.find(query);
            const users = await cursor.toArray();
            res.send(users) 
        });

        app.get('/inventory', async(req, res) => {
            const query = {};
            const cursor = inventory.find(query);
            const users = await cursor.toArray();
            res.send(users) 
        });

        app.get('/inventory/:itemId', async (req, res) => {
            const id = req.params.itemId;
            const query = { _id: ObjectId(id) };
            const item = await inventory.findOne(query);
            res.send(item);
        });

        app.put('/inventory/:itemId', async (req, res) => {
            const id = req.params.itemId;
            const updatedItem = req.body;
            const item = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            };
            const result = await inventory.updateOne(item, updatedDoc, options);
            res.send(result);
        });
        app.delete('/inventory/:itemId', async (req, res) => {
            const id = req.params.itemId;
            const item = { _id: ObjectId(id) };
            const result = await inventory.deleteOne(item);
            res.send(result);
        });

        app.delete("/inventory", async (req, res) => {
            items = [];
            await res.redirect("/inventory");
        });
        
        app.post('/addItems', async (req, res) => {
            const newItem = req.body;
            const tokenInfo = req.headers.authorization;
            const [email, accessToken] = tokenInfo.split(" ")
            const decoded = verifyToken(accessToken);
            if (email === decoded.email) {
                const result = await inventory.insertOne(newItem);
                res.send(result);
            }
            else{
                res.send({success: "Unauthorized Access"})
            }

        });

        app.post('/login', async (req, res) => {
            const email = req.body;
            const token = await jwt.sign(email, process.env.ACCESS_TOKEN);
            res.send({ token });
        });

    }
    finally {
        // clint not closed
    }
}

run().catch(console.dir);


function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if(err) {
            email = 'Invalid Email'
        }
        if (decoded) {
            email = decoded
        }
    });
    return email;
};

app.listen(port, () => {
    console.log('Molinard is Boom');
});