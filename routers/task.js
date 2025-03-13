const {Router} = require("express");
const { v4: uuid4 } = require('uuid');
const {TaskRecord} = require("../records/task.record");
const {authenticateUser} = require("../middlewares/auth.middleware");
const {ValidationError, UnauthorizedError} = require("../utils/errors");

const taskRouter = Router();

const formatTaskResponse = (task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    isCompleted: task.is_completed,
    createdAt: task.created_at,
});

const validateTaskOwnership = (task, userId) => {
    if (!task) {
        throw new ValidationError('No task with this id found!');
    }
    if (task.user_id !== userId) {
        throw new UnauthorizedError('Not authorized to perform this action');
    }
};

taskRouter
    .post('/', authenticateUser, async (req, res) => {
        const {title, description, isCompleted} = req.body;

        const newTask = new TaskRecord({
            id: uuid4(),
            user_id: req.user.id,
            title,
            description,
            is_completed: isCompleted,
        });

        await newTask.save();

        res
            .status(201)
            .json({
                ok: true,
                data: formatTaskResponse(newTask),
            });
    })
    .patch('/:id', authenticateUser, async (req, res) => {
        const {title, description, isCompleted} = req.body;

        const task = await TaskRecord.find(req.params.id);

        if (!task) {
            throw new ValidationError('No task with this id found!');
        }

        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.is_completed = isCompleted ?? task.is_completed;

        await task.update();

        res.status(200).json({
            ok: true,
            data: formatTaskResponse(task),
        });
    })
    .delete('/:id', authenticateUser, async (req, res) => {
        const task = await TaskRecord.find(req.params.id);

        validateTaskOwnership(task, req.user.id);
        await task.delete();

        res.status(200).json({ok: true});
    })
    .get('/', authenticateUser, async (req, res) => {
        const taskList = await TaskRecord.findAll(req.user.id);

        res.status(200).json({
            ok: true,
            data: taskList.map(formatTaskResponse),
        });
    });

module.exports = {
    taskRouter,
};
