const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@molinardcluster.ixezn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)


async function run() {
    try {
        await client.connect();
        const inventory = client.db('molinardInventory').collection('inventoryIteams');
        app.get('/inventory', async (req, res) => {
            const email = req.query.email;
            const query = {email};
            const cursor = inventory.find(query);
            const inventoryItems = await cursor.toArray();
            res.send(inventoryItems);
        });
        app.get('/inventory/:itemId', async(req, res) => {
            const id = req.params.itemId;
            const query = {_id: ObjectId(id)};
            const item = await inventory.findOne(query);
            res.send(item);
        });
        app.post('/inventory', async(req, res) => {
            const newItem = req.body;
            const result = await inventory.insertOne(newItem);
            res.send(result);
        });
        app.put('/inventory/:itemId', async(req, res) => {
            const id = req.params.itemId;
            const updatedItem = req.body;
            const item = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            };
            const result = await inventory.updateOne(item, updatedDoc, options);
            res.send(result);
        });
        app.delete('/inventory/:itemId', async(req, res) => {
            const id = req.params.itemId;
            const item = {_id: ObjectId(id)};
            const result = await inventory.deleteOne(item);
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("HeY Molinard Please Response");
});

app.listen(port, () => {
    console.log('Molinard is Booming');
});