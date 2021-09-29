const express = require('express');
const redis = require('redis');
const cors = require('cors');
const axios = require('axios');
const mongoose = require("mongoose");

const redClient = redis.createClient(6379)
const app = express();
app.use(cors());

app.get("/photos", (req, res) => {
    const title = req.query.title;
    redClient.get(`photos?title=${title}`, (err, data) => {
        if (err) {
            console.log(err);
        } else if (data != null) {
            console.log("Cache hit");
            return res.json(JSON.parse(data));
        } else {
            console.log("Cache miss");
            const {setData} = axios.get("http://jsonplaceholder.typicode.com/photos", {params: {title}});
            redClient.set(`photos?title=${title}`, 3600, JSON.stringify(setData));
            res.json(setData);
        }
    });
});

app.listen(3000, () => {
    console.log('App listening on port 3000');
});


// contactSchema.get(function(req, res) {
//     if (err) {
//         res.json ({
//             status: "error",
//             message: err,
//         });
//     } else {
//         res.json({
//             status: "success",
//             data: res
//         });
//     }
// });
//res.status(200).send(album.find().forEach(print));
// res.status(200).send(album.find({}).toArray(function(err, results){
//     results.json
// }));


// var contactSchema = mongoose.Schema({
//     id: {
//         type: String,
//         required: true
//     },
//     title: {
//         type: String,
//         required: true
//     },
//     carVIN:  {
//         type: String,
//         required: true
//     }
// });

