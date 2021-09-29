const express = require('express');
const redis = require('redis');
const cors = require('cors');
const axios = require('axios');
let mongoose = require('mongoose');
const {promisify} = require('util');

const app = express();
app.use(cors());
const uri = 'mongodb://localhost:27017/myphotos';
mongoose.connect(uri, {useNewUrlParser: true});
var db = mongoose.connection;

const redClient = redis.createClient(6379)
const GET_ASYNC = promisify(redClient.get).bind(redClient)
const SET_ASYNC = promisify(redClient.set).bind(redClient)

// Check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")


let album = db.collection('album');

app.get('/photos', async (req, res) => {
    const reply = await GET_ASYNC('photos');
    if (reply) {
        console.log('using cached data');
        res.send(JSON.parse(reply));
        return
    }
    const response = album.find({});
    var setArray = [];
    response.toArray(async function (err, result) {
        var i, count;
        for (i = 0, count = result.length; i < count; i++) {
            setArray.push(result[i]);
        }
        //save data into cache before returning data
        const saveResult = await SET_ASYNC('photos', JSON.stringify(setArray), 'EX', 5);
        console.log('new data cached');

        return res.json(setArray);
    });

});





app.listen(3000, () => {
    console.log('App listening on port 3000');
});