const {Router} = require("express");
const { v4: uuid4 } = require('uuid');
const {authenticateUser} = require("../middlewares/auth.middleware");
const {EventRecord} = require("../records/event.record");
const {ValidationError, UnauthorizedError} = require("../utils/errors");

const eventRouter = Router();

const formatEventResponse = (event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startTime: event.start_time,
    endTime: event.end_time,
    color: event.color,
    isRecurring: event.is_recurring,
    dayOfWeek: event.day_of_week,
    // createdAt: event.created_at,
    createdAt: event.created_at.toISOString(),
});

const validateEventOwnershipMiddleware = async (req, res, next) => {
    const event = await EventRecord.find(req.params.id);

    if (!event) {
        throw new ValidationError('No event with this id found!');
    }

    if (event.user_id !== req.user.id) {
        throw new UnauthorizedError('Not authorized to perform this action');
    }

    req.event = event;
    next();
};

eventRouter
    .post('/', authenticateUser, async (req, res) => {
        const {title, description, startTime, endTime, color, isRecurring, dayOfWeek} = req.body;

        const data = {
            id: uuid4(),
            user_id: req.user.id,
            title,
            description,
            start_time: startTime,
            end_time: endTime,
            color,
            is_recurring: isRecurring,
            day_of_week: dayOfWeek,
        };

        const newEvent = new EventRecord(data);
        const addedEvent = await newEvent.save();

        res
            .status(201)
            .json({
                ok: true,
                data: formatEventResponse(addedEvent),
            });
    })
    .patch('/:id', authenticateUser, validateEventOwnershipMiddleware, async (req, res) => {
        const {title, description, startTime, endTime, color, isRecurring, dayOfWeek} = req.body;

        const event = req.event;

        event.title = title ?? event.title;
        event.description = description ?? event.description;
        event.start_time = startTime ?? event.start_time;
        event.end_time = endTime ?? event.end_time;
        event.color = color ?? event.color;
        event.is_recurring = isRecurring !== undefined ? isRecurring : event.is_recurring;
        event.day_of_week = dayOfWeek ?? event.day_of_week;

        const addedEvent = await event.update();

        res.status(200).json({
            ok: true,
            data: formatEventResponse(addedEvent),
        });
    })
    .get('/', authenticateUser, async (req, res) => {
        const eventList = await EventRecord.findAll(req.user.id);

        res.status(200).json({
            ok: true,
            data: eventList.map(formatEventResponse),
        })
    })
    .delete('/:id', authenticateUser, validateEventOwnershipMiddleware, async (req, res) => {
        await req.event.delete();

        res.status(200).json({ok: true});
    })
    .delete('/', authenticateUser, async (req, res) => {
        await EventRecord.deleteNotRecurring(req.user.id);

        res.status(200).json({ok: true});
    });


module.exports = {
    eventRouter,
};
