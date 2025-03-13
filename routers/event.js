const {Router} = require("express");
const { v4: uuid4 } = require('uuid');
const {authenticateUser} = require("../middlewares/auth.middleware");
const {EventRecord} = require("../records/event.record");

const eventRouter = Router();
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
        await newEvent.save();

        res
            .status(201)
            .json({
                ok: true,
                data: {
                    id: newEvent.id,
                    title: newEvent.title,
                    description: newEvent.description,
                    startTime: newEvent.start_time,
                    endTime: newEvent.end_time,
                    color: newEvent.color,
                    isRecurring: newEvent.is_recurring,
                    dayOfWeek: newEvent.day_of_week,
                    createdAt: newEvent.created_at,
                },
            });
    });

module.exports = {
    eventRouter,
};
