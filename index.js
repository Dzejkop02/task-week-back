require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());


app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
