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
    // createdAt: task.created_at,
    createdAt: task.created_at.toISOString(),
});

const validateTaskOwnershipMiddleware = async (req, res, next) => {
    const task = await TaskRecord.find(req.params.id);

    if (!task) {
        throw new ValidationError('No task with this id found!');
    }

    if (task.user_id !== req.user.id) {
        throw new UnauthorizedError('Not authorized to perform this action');
    }

    req.task = task;
    next();
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

        const addedTask = await newTask.save();

        res
            .status(201)
            .json({
                ok: true,
                data: formatTaskResponse(addedTask),
            });
    })
    .patch('/:id', authenticateUser, validateTaskOwnershipMiddleware, async (req, res) => {
        const {title, description, isCompleted} = req.body;

        const task = req.task;

        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.is_completed = isCompleted !== undefined ? isCompleted : task.is_completed;

        const addedTask = await task.update();

        res.status(200).json({
            ok: true,
            data: formatTaskResponse(addedTask),
        });
    })
    .delete('/:id', authenticateUser, validateTaskOwnershipMiddleware, async (req, res) => {
        await req.task.delete();

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
