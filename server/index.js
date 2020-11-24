const express = require('express');
const app = express();
const router = express.Router();
const port = 3000;
const { body, validationResult } = require('express-validator');

const catalog = require('./data/timetable-data.json');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./data/db.json');
const db = low(adapter);

db.defaults({ schedules: [] }).write();

app.use('/', express.static('static'));

router.use((req, res, next) => {
    console.log('Request: ', req.method, ' Path: ', req.url, 'Time: ', Date.now());
    next();
});

router.use(express.json());

// Get all available subject codes and descriptions
router.get('/catalog', (req, res) => {
    let data = [];
    for (c in catalog) {
        data.push({subject:catalog[c].subject, description:catalog[c].className});
    }
    res.send(data);
});

// Get all course codes for a given subject code, return error if subject doesn't exist
router.get('/catalog/courses/:subject', (req, res) => {
    let data = [];
    for (c in catalog) {
        if (catalog[c].subject === req.params.subject) {
            data.push({courseCode:catalog[c].catalog_nbr});
        }
    }
    if (data.length === 0) res.status(404).send({ "error" : "Subject not found" });
    else res.status(200).send(data);
});

// Get timetable entry for given subject/course code and optional course component
router.get('/catalog/:subject/:course?/:component?/:extracomponent?', (req, res) => {
    let data = [];
    let s = 0;
    for (c in catalog) {
        if (catalog[c].subject === req.params.subject) {
            s++;
            if (req.params.course) {
                if (catalog[c].catalog_nbr.toString() === req.params.course.toString()) {
                    if (req.params.component) {
                        if (catalog[c].course_info[0].ssr_component === req.params.component) {
                            data.push({subject:catalog[c].subject, courseCode:catalog[c].catalog_nbr, description:catalog[c].className, courseInfo:catalog[c].course_info, ext_description:catalog[c].catalog_description});
                        }
                        if (req.params.extracomponent) {
                            if (catalog[c].course_info[0].ssr_component === req.params.extracomponent) {
                                data.push({subject:catalog[c].subject, courseCode:catalog[c].catalog_nbr, description:catalog[c].className, courseInfo:catalog[c].course_info, ext_description:catalog[c].catalog_description});
                            }
                        }
                    }
                    else {
                        data.push({subject:catalog[c].subject, courseCode:catalog[c].catalog_nbr, description:catalog[c].className, courseInfo:catalog[c].course_info, ext_description:catalog[c].catalog_description});
                    }
                }
            }
            else {
                data.push({subject:catalog[c].subject, courseCode:catalog[c].catalog_nbr, description:catalog[c].className, courseInfo:catalog[c].course_info, ext_description:catalog[c].catalog_description});
            }
        }
    }
    if (data.length !== 0) {
        res.status(200).send(data);
    }
    else {
        if (s === 0) res.status(404).send({ "error" : "Subject not found." });
        else res.status(404).send({ "error" : "Course not found." });
    }
});

// Create a schedule with a given name, return an error if name exists
router.put('/schedules', [
    body('name').isLength({ min: 3, max: 20 }).trim().escape(),
    body('courses').isArray(),
    body('courses.*.subject').trim().escape(),
    body('courses.*.courseCode').isLength({ max: 5 }).trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    else {
        const data = req.body;
        if (db.get('schedules').find({name: data.name}).value()) res.status(403).send({ "error" : "Cannot create, schedule name already exists." });
        else {
            db.get('schedules').push(data).write();
            res.status(200).send({ "success" : "Schedule created." });
        }
    }
});

// Update an existing schedule, return an error if it does not exist
router.post('/schedules', [
    body('name').isLength({ min: 3, max: 20 }).trim().escape(),
    body('courses').isArray(),
    body('courses.*.subject').trim().escape(),
    body('courses.*.courseCode').isLength({ max: 5 }).trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    else {
        const data = req.body;
        if (!db.get('schedules').find({name: data.name}).value()) res.status(404).send({ "error" : "Cannot update, schedule does not exist." });
        else {
            db.get('schedules').find({name: data.name}).assign({courses: data.courses}).write();
            res.status(200).send({ "success" : "Schedule updated." });
        }
    }
});

// Get the subject/course codes for a given schedule
router.get('/schedules/:specific', (req, res) => {
    if (!db.get('schedules').find({ name: req.params.specific }).value()) res.status(404).send({ "error" : "Cannot get courses, schedule does not exist." });
    else {
        let courses = db.get('schedules').find({ name: req.params.specific }).get('courses').value();
        res.status(200).send(courses);
    }
});

// Get list of schedules and number of courses per schedule
router.get('/schedules', (req, res) => {
    let data = [];
    for (s in db.get('schedules').value()) {
        data.push({name:db.get(`schedules[${s}].name`), number:db.get(`schedules[${s}].courses`).size().value()});
    }
    res.status(200).send(data);
});

// Delete a schedule with a given name
router.delete('/schedules/specific', [
    body('name').isLength({ min: 3 }).trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    else {
        const data = req.body;
        if (!db.get('schedules').find({ name: data.name }).value()) res.status(404).send({ "error" : "Cannot delete, schedule does not exist." });
        else {
            db.get('schedules').remove({ name: data.name }).write();
            res.status(200).send({ "success" : "Schedule deleted." });
        }
    }
});

// Delete all schedules
router.delete('/schedules', (req, res) => {
    db.get('schedules').remove().write();
    res.status(200).send({ "success" : "All schedules deleted." })
});

app.use('/api', router); // Set the routes at '/api'

app.listen(port);
console.log(`Listening on port ${port}`);
