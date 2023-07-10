const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
var axios = require("axios").default;
const app = express();
const path = require("path");
const config = require("./config");
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV == "production") {
    console.log = function () { };
}
app.get("/", (req, res) => {
    res.send("Hello World!");
});
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, }).then((data) => {
    console.log(`Mongodb connected with server: ${data.connection.host}`);
});
if (!config.METERED_DOMAIN) {
    throw new Error(
        "Please specify the METERED_DOMAIN.\nAdd as an environment variable or in the .env file or directly specify in the src/config.js\nIf you are unsure where to get METERED_DOMAIN please read the Advanced SDK Guide here: https://metered.ca/docs/Video%20Calls/JavaScript/Building%20a%20Group%20Video%20Calling%20Application"
    );
}
if (!config.METERED_SECRET_KEY) {
    throw new Error(
        "Please specify the METERED_SECRET_KEY.\nAdd as an environment variable or in the .env file or directly specify in the src/config.js\nIf you are unsure where to get METERED_SECRET_KEY please read the Advanced SDK Guide here: https://metered.ca/docs/Video%20Calls/JavaScript/Building%20a%20Group%20Video%20Calling%20Application"
    );
}
app.get("/validate-meeting", function (req, res) {
    var options = {
        method: "GET",
        url: "https://" + config.METERED_DOMAIN + "/api/v1/room/" + req.query.meetingId,
        params: {
            secretKey: config.METERED_SECRET_KEY,
        },
        headers: {
            Accept: "application/json",
        },
    };
    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
            res.send({ success: true, });
        })
        .catch(function (error) {
            console.error(error);
            res.send({
                success: false,
            });
        });
});
app.post("/create-meeting-room", function (req, res) {
    var options = {
        method: "POST",
        url: "https://" + config.METERED_DOMAIN + "/api/v1/room/",
        params: {
            secretKey: config.METERED_SECRET_KEY,
        },
        headers: {
            Accept: "application/json",
        },
    };

    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
            res.send({ success: true, ...response.data });
        })
        .catch(function (error) {
            console.error(error);
            res.send({
                success: false,
            });
        });
});

app.get("/metered-domain", function (req, res) {
    res.send({
        domain: config.METERED_DOMAIN,
    });
});
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}!`);
});

module.exports = { handler: serverless(app) };



