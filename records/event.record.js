const {pool} = require("../utils/db");
const {ValidationError} = require("../utils/errors");

const hexRegex = /^#([0-9A-Fa-f]{6})$/;
const timeRegex = /^(?:(?:0?\d|1\d|2[0-3]):[0-5]\d(?::[0-5]\d)?|24:00(?::00)?)$/;
const toMinutes = (time) => {
    if (time === '24:00') return 24 * 60;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

class EventRecord {
    constructor(obj) {
        this.validate(obj);

        this.id = obj.id;
        this.user_id = obj.user_id;
        this.title = obj.title;
        this.description = obj?.description;
        this.start_time = obj.start_time;
        this.end_time = obj.end_time;
        this.color = obj.color;
        this.is_recurring = obj?.is_recurring ?? false;
        this.day_of_week = obj.day_of_week;
        this.created_at = obj?.created_at;
    }

    validate(obj) {
        if (!obj.title || obj.title.length > 100) {
            throw new ValidationError('Invalid title.');
        }

        if (obj.description && obj.description.length > 255) {
            throw new ValidationError('Invalid description.');
        }

        if (!hexRegex.test(obj.color)) {
            throw new ValidationError('Invalid color.');
        }

        if (!timeRegex.test(obj.start_time)) {
            throw new ValidationError('Invalid start time.');
        }

        if (!timeRegex.test(obj.end_time)) {
            console.log('Invalid time:', obj.end_time)
            throw new ValidationError('Invalid end time.');
        }

        if (toMinutes(obj.end_time) <= toMinutes(obj.start_time)) {
            throw new ValidationError('End time must be later than start time.');
        }

        if (obj.day_of_week < 1 || obj.day_of_week > 7) {
            throw new ValidationError('day_of_week should be number between 1 and 7.');
        }
    }

    static async find(id) {
        const {rows} =  await pool.query(`SELECT * FROM events WHERE id = ($1)`, [id]);
        return rows[0] ? new EventRecord(rows[0]) : null;
    }

    static async findAll(userId) {
        const {rows} =  await pool.query(`SELECT * FROM events WHERE user_id = ($1)`, [userId]);
        return rows.map(result => new EventRecord(result));
    }

    async save() {
        const result = await pool.query(
            `INSERT INTO events (id, user_id, title, description, start_time, end_time, color, is_recurring, day_of_week) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [
            this.id, this.user_id, this.title, this.description, this.start_time, this.end_time, this.color, this.is_recurring, this.day_of_week
        ]);

        if (result.rowCount < 1) {
            throw new Error('Error while adding new user.');
        }

        return new EventRecord(result.rows[0]);
    }

    async update() {
        this.validate(this);

        const result = await pool.query(`UPDATE events SET title = ($1), description = ($2), start_time = ($3), end_time = ($4), color = ($5), is_recurring = ($6), day_of_week = ($7) WHERE id = ($8) RETURNING *`, [
            this.title, this.description, this.start_time, this.end_time, this.color, this.is_recurring, this.day_of_week, this.id
        ]);

        if (result.rowCount < 1) {
            throw new Error('Error updating event.');
        }

        return new EventRecord(result.rows[0]);
    }

    async delete() {
        const result = await pool.query(`DELETE FROM events WHERE id = ($1)`, [
            this.id
        ]);

        if (result.rowCount < 1) {
            throw new Error('Error deleting event.');
        }
    }

    static async deleteNotRecurring(user_id) {
        const result = await pool.query(`DELETE FROM events WHERE user_id = ($1) AND is_recurring = false`, [
            user_id
        ]);

        if (result.rowCount < 1) {
            throw new Error('Error deleting event.');
        }
    }
}

module.exports = {
    EventRecord,
};
