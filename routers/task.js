const {Router} = require("express");
const { v4: uuid4 } = require('uuid');
const {TaskRecord} = require("../records/task.record");
const {authenticateUser} = require("../middlewares/auth.middleware");

const taskRouter = Router();

taskRouter
    .post('/', authenticateUser, async (req, res) => {
        const {title, description, is_completed} = req.body;

        const data = {
            id: uuid4(),
            user_id: req.user.id,
            title,
            description,
            is_completed,
        };

        const newTask = new TaskRecord(data);
        await newTask.save();

        res
            .status(201)
            .json({
                ok: true,
                data: {
                    title: newTask.title,
                    description: newTask.description,
                    is_completed: newTask.is_completed,
                    created_at: newTask.created_at,
                },
            });
    });

module.exports = {
    taskRouter,
};
