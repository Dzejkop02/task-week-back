require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const {handleError} = require("./utils/errors");

const {userRouter} = require("./routers/user");
const {authRouter} = require("./routers/auth");
const {taskRouter} = require("./routers/task");
const {eventRouter} = require("./routers/event");

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

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/task', taskRouter);
app.use('/event', eventRouter);

app.use(handleError);

app.listen(port, 'localhost', () => {
    console.log(`Listening on http://localhost:${port}`);
});
