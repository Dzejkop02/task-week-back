require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    // allowedHeaders: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(cookieParser());

app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());


app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
