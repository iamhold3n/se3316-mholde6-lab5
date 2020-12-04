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

db.defaults({ schedules: [], users: [] }).write();

// firebase SDK authentication
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://se3316-mholde6-lab5.firebaseio.com'
});

var stringSimilarity = require('string-similarity');

app.use('/', express.static('static'));

router.use((req, res, next) => {
    console.log('Request: ', req.method, ' Path: ', req.url, 'Time: ', Date.now());
    next();
});

router.use(express.json());

// === LEGACY ROUTES ===
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

// === ** LAB 5 NEW ** ===
// === GUEST ROUTES ===
// search catalog by subject/course/suffix
router.get('/combo/:subject/:course/:suffix?', (req, res) => {
    let data = [];

    for (c in catalog) {
        if (catalog[c].subject === req.params.subject) {
            if (req.params.suffix) {
                if (catalog[c].catalog_nbr.toString() === (req.params.course.toString() + req.params.suffix))
                    data.push({subject:catalog[c].subject, courseCode:catalog[c].catalog_nbr, description:catalog[c].className, courseInfo:catalog[c].course_info, ext_description:catalog[c].catalog_description});
            } else {
                if (catalog[c].catalog_nbr.toString().substr(0,4) === req.params.course.toString())
                    data.push({subject:catalog[c].subject, courseCode:catalog[c].catalog_nbr, description:catalog[c].className, courseInfo:catalog[c].course_info, ext_description:catalog[c].catalog_description});
            }
        }
    }

    if (data.length !== 0) res.status(200).send(data);
    else res.status(404).send({ "error" : "Course not found." });
})

// search catalog for soft keywords
router.get('/soft/:key', (req, res) => {
    let data = [];

    if (req.params.key.toString().length < 4) {
        res.status(403).send({ "error" : "Keyword length invalid." });
    } else {
        for (c in catalog) {
            if ((stringSimilarity.compareTwoStrings(catalog[c].catalog_nbr.toString(), req.params.key.toString()) > 0.6) || (stringSimilarity.compareTwoStrings(catalog[c].className, req.params.key.toString().toUpperCase()) > 0.4))
                data.push({subject:catalog[c].subject, courseCode:catalog[c].catalog_nbr, description:catalog[c].className, courseInfo:catalog[c].course_info, ext_description:catalog[c].catalog_description});
        }

        if (data.length !== 0) res.status(200).send(data);
        else res.status(404).send({ "error" : "No courses match keyword." });
    }
})

// get all public schedules
router.get('/schedule', (req, res) => {
    let data = [];
    let filter = db.get('schedules').filter({private: false}).orderBy('date', 'desc').take(10).value();
    for (s in filter) {
        filter[s].number = filter[s].courses.length
        data.push(filter[s]);
    }
    res.status(200).send(data);
})

// get specific public schedule timetable
router.get('/schedule/:specific', (req, res) => {
    if (!db.get('schedules').find({ name: req.params.specific }).value()) res.status(404).send({ "error" : "Cannot get courses, schedule does not exist." });
    else {
        if (db.get('schedules').find({ name: req.params.specific }).get('private').value()) res.status(403).send({ error: "Not authorized." })
        else {
            let courses = db.get('schedules').find({ name: req.params.specific }).get('courses').value();
            res.status(200).send(courses);
        }
    }
})

// === USER ROUTES ===
// get list of created schedules for user
router.get('/auth/schedule/:user', (req, res) => {
    let authStatus, adminStatus, decoded;
    checkAuth(req, authStatus, adminStatus, decoded);
    if (authStatus) {
        // get all schedules in database for specific user
    }
    else res.status(403).send({ error : "Not authorized." });
});

// get specific schedule for user
router.get('/auth/schedule/:user/:specific', (req, res) => {
    let authStatus, adminStatus, decoded;
    checkAuth(req, authStatus, adminStatus, decoded);
    if (authStatus) {
        // get specific schedule in database for specific user
    }
    else res.status(403).send({ error : "Not authorized." });
});

// create new schedule for user
router.put('/auth/schedule', [
    body('name').isLength({ min: 3, max: 20 }).trim().escape(),
    body('courses').isArray(),
    body('courses.*.subject').trim().escape(),
    body('courses.*.courseCode').isLength({ max: 5 }).trim().escape()
], (req, res) => {
    authHeader = req.header('Authorization');

    if (authHeader) {
        const bearer = authHeader.split(' ');
        const token = bearer[1];

        admin.auth().verifyIdToken(token)
        .then((decodedToken) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()){
                return res.status(400).json({ errors: errors.array() });
            }
            else {
                const data = req.body;
                if (db.get('schedules').find({name: data.name}).value()) res.status(403).send({ error : "Cannot create, schedule name already exists." });
                else {
                    db.get('schedules').push(data).write();
                    res.status(200).send({ "success" : "Schedule created." });
                }
            }
        }).catch((error) => {
            res.status(403).send({ error : "Not authorized." });
        })
    }
});

// update existing schedule for user
router.post('/auth/schedule', [
    body('name').isLength({ min: 3, max: 20 }).trim().escape(),
    body('courses').isArray(),
    body('courses.*.subject').trim().escape(),
    body('courses.*.courseCode').isLength({ max: 5 }).trim().escape()
], (req, res) => {
    authHeader = req.header('Authorization');

    if (authHeader) {
        const bearer = authHeader.split(' ');
        const token = bearer[1];

        admin.auth().verifyIdToken(token)
        .then((decodedToken) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()){
                return res.status(400).json({ errors: errors.array() });
            }
            else {
                const data = req.body;
                if (!db.get('schedules').find({name: data.name}).value()) res.status(404).send({ error : "Cannot update, schedule does not exist." });
                else {
                    db.get('schedules').remove({ name: data.name }).write();
                    db.get('schedules').push(data).write();
                    res.status(200).send({ "success" : "Schedule updated." });
                }
            }
        }).catch((error) => {
            res.status(403).send({ error : "Not authorized." });
        })
    }
})

// delete existing schedule for user
router.delete('/auth/schedule', (req, res) => {
    let authStatus, adminStatus, decoded;
    checkAuth(req, authStatus, adminStatus, decoded);
    if (authStatus) {
        // delete schedule in database for user
    }
    else res.status(403).send({ error : "Not authorized." });
});

// add a comment to a course from a user
router.put('/auth/review', (req, res) => {
    let authStatus, adminStatus, decoded;
    checkAuth(req, authStatus, adminStatus, decoded);
    if (authStatus) {
        // create review of course from user in database
    }
    else res.status(403).send({ error : "Not authorized." });
});

// === ADMIN ROUTES ===
// get list of users
router.get('/admin/user', (req, res) => {
    let authStatus, adminStatus, decoded;
    checkAuth(req, authStatus, adminStatus, decoded);
    if (authStatus && adminStatus) {
        // grab users from database
    }
    else res.status(403).send({ error : "Not authorized." });
});

// change permissions or status of user
router.post('/admin/user', (req, res) => {
    let authStatus, adminStatus, decoded;
    checkAuth(req, authStatus, adminStatus, decoded);
    if (authStatus && adminStatus) {
        // change user account in database
    }
    else res.status(403).send({ error : "Not authorized." });
});

// get list of reviews
router.get('/admin/review', (req, res) => {
    let authStatus, adminStatus, decoded;
    checkAuth(req, authStatus, adminStatus, decoded);
    if (authStatus && adminStatus) {
        // get list of reviews from database
    }
    else res.status(403).send({ error : "Not authorized." });
});

// change reviews
router.post('/admin/review', (req, res) => {
    let authStatus, adminStatus, decoded;
    checkAuth(req, authStatus, adminStatus, decoded);
    if (authStatus && adminStatus) {
        // hide or show review from database
    }
    else res.status(403).send({ error : "Not authorized." });
});

app.use('/api', router); // Set the routes at '/api'

app.listen(port);
console.log(`Listening on port ${port}`);
