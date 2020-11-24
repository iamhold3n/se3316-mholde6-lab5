document.getElementById('selectSubject').addEventListener('change', getDesc);
document.getElementById('selectCourse').addEventListener('change', showComponent);

var subjectAndDesc;
var badchar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
const search = document.getElementById('search');
const saved = document.getElementById('saved');
const buildSel = document.getElementById('buildSel');
const savedSel = document.getElementById('savedSel');
var schedBuilder = { name: "", courses: [] };
populateSubjects();
searchMode();

// query server for all the different subjects and populate drop down bar
function populateSubjects() {
    fetch("/api/catalog")
    .then((res) => res.json())
    .then(data => {
        subjectsAndDesc = data;
        const s = document.getElementById('selectSubject');
        subjectsAndDesc.forEach(e => {
            if (s.lastElementChild.getAttribute("value") !== e.subject) {
                const item = document.createElement('option');
                item.setAttribute("value", e.subject);
                item.appendChild(document.createTextNode(`${e.subject}`));
                s.appendChild(item);
            }
        })
    })
}

// check if name of schedule exists, and pass off to create or update schedule methods
function saveSchedule() {
    const name = document.getElementById('saveName').value;
    if (name !== "") {
        if (badchar.test(name)) {
            alert("Disallowed characters are detected, please try again with a new schedule name.");
        }
        else {
            schedBuilder.name = name;
            fetch(`api/schedules/${name}`)
            .then((res) => res.status)
            .then(data => {
                if (data === 200) updateSchedule(schedBuilder);
                else if (data === 404) createSchedule(schedBuilder);
            })
        }
    }
    else {
        alert("Please enter a schedule name.");
    }
}

// create a new schedule with a given name
function createSchedule(sch) {
    fetch('api/schedules', { method: 'put', headers: { "Content-Type" : "Application/json"}, body: JSON.stringify(sch) })
    .then((res) => res.status)
    .then(data => {
        if (data === 200) {
            alert("Schedule successfully created.");
        }
        else {
            alert("Schedule name already exists.")
        }
    })
}

// update course schedule with a given name
function updateSchedule(sch) {
    fetch('api/schedules', { method: 'post', headers: { "Content-Type" : "Application/json"}, body: JSON.stringify(sch) })
    .then((res) => res.status)
    .then(data => {
        if (data === 200) {
            alert("Schedule successfully update.");
        }
        else {
            alert("Schedule update failed.");
        }
    })

}

// get all schedule names and print the corresponding number of courses they contain
function getAllSchedules() {
    fetch('/api/schedules')
    .then((res) => res.json())
    .then(data => {
        const s = document.getElementById('savedschedules');
        while (s.lastElementChild !== s.firstElementChild) s.removeChild(s.lastElementChild);
        const title = document.createElement('li');
        const titleData = document.createTextNode("Schedule names and number of courses in them: ");
        title.appendChild(titleData);
        s.appendChild(title);


        data.forEach(e => {
            const sched = document.createElement('li');
            const name = document.createElement('span');
            name.className = "subject";
            const nameData = document.createTextNode(e.name);
            name.appendChild(nameData);
            sched.appendChild(name);

            const num = document.createElement('span');
            const numData = document.createTextNode(e.number);
            num.className = "course";
            num.appendChild(numData);
            sched.appendChild(num);
            s.appendChild(sched);
        })
    })
}

// get and print a schedule with a given name
function getSpecificSchedule() {
    const s = document.getElementById('savedschedules');
    while (s.lastElementChild !== s.firstElementChild) s.removeChild(s.lastElementChild);

    const sname = document.getElementById('schedInput').value;

    if (sname !== "") {
        if (badchar.test(sname)) {
            alert("Disallowed characters are detected, please try again with a new schedule name.");
        }
        else {
            fetch(`/api/schedules/${sname}`)
            .then((res) => res.json())
            .then(data => {
                if (data.error) {
                    const error = document.createElement('li');
                    const errorMsg = document.createTextNode(data.error);
                    error.appendChild(errorMsg);
                    s.appendChild(error);
                }
                else {
                    const title = document.createElement('li');
                    const titleData = document.createTextNode(`Courses for schedule: ${sname}`);
                    title.appendChild(titleData);
                    s.appendChild(title);

                    data.forEach(e => {
                        getTimeTable(s, e.subject, e.courseCode, "", false);
                    })
                }
            })
        }
    }
    else {
        alert("Please enter a schedule name before searching.");
    }
}

// delete all stored schedules
function deleteAllSchedules() {
    fetch('/api/schedules', { method: 'delete' })
    .then((res) => res.json())
    .then(data => {
        if (data.success) {
            const s = document.getElementsById('savedschedules');
            while (s.lastElementChild !== s.firstElementChild) s.removeChild(s.lastElementChild);

            const success = document.createElement('li');
            const successMsg = document.createTextNode(data.success);
            success.appendChild(successMsg);
            s.appendChild(success);
        }
    })
}

// delete a schedule with a given name
function deleteSpecificSchedule() {
    const s = document.getElementById('savedschedules');
    while (s.lastElementChild !== s.firstElementChild) s.removeChild(s.lastElementChild);

    const sname = document.getElementById('schedInput').value;
    const sch = { name : sname };

    if (sname !== "") {
        if (badchar.test(sname)) {
            alert("Disallowed characters are detected, please try again with a new schedule name.");
        }
        else {
            console.log(sch);
            fetch('/api/schedules/specific', { method: 'delete', headers: { "Content-Type" : "Application/json"}, body: JSON.stringify(sch) })
            .then((res) => res.json())
            .then(data => {
                if (data.success) {
                    const success = document.createElement('li');
                    const successMsg = document.createTextNode(data.success);
                    success.appendChild(successMsg);
                    s.appendChild(success);
                }
                else {
                    const error = document.createElement('li');
                    const errorMsg = document.createTextNode(data.error);
                    error.appendChild(errorMsg);
                    s.appendChild(error);
                }
            })
        }
    }
    else {
        alert("Please enter a schedule name before deleting.");
    }
}

// get and show the descriptions for the courses
function getDesc() {
    const c = document.getElementById('selectCourse');
    const carea = document.getElementById('searchCourse');
    while (c.lastElementChild !== c.firstElementChild) c.removeChild(c.lastElementChild);
    showComponent();

    const s = document.getElementById('selectSubject').value;
    if(s === "") {
        carea.style.display = "none";
    }
    else {
        carea.style.display = "block";
        var courseList = [];
        subjectsAndDesc.forEach(e => { if (e.subject === s) courseList.push(e); })
        fetch(`/api/catalog/${s}`)
        .then((res) => res.json())
        .then(data => {
            for(let i = 0; i < courseList.length; i++) {
                const item = document.createElement('option');
                item.setAttribute("value", data[i].courseCode);
                item.appendChild(document.createTextNode(`${data[i].courseCode} ${courseList[i].description}`));
                c.appendChild(item);
            }
        })
    }
}

// get the timetable for the search area
function getSearchTimetable() {
    const s = document.getElementById('selectSubject').value;
    const c = document.getElementById('selectCourse').value;
    const oLEC = document.getElementById('checkLEC');
    const oTUT = document.getElementById('checkTUT');
    const oLAB = document.getElementById('checkLAB');
    let o = "";

    if (oLEC.checked && oTUT.checked && !oLAB.checked) o = "LEC/TUT";
    else if (oLEC.checked && !oTUT.checked && oLAB.checked) o = "LEC/LAB";
    else if (!oLEC.checked && oTUT.checked && oLAB.checked) o = "TUT/LAB";
    else if (oLEC.checked && !oTUT.checked && !oLAB.checked) o = "LEC";
    else if (!oLEC.checked && oTUT.checked && !oLAB.checked) o = "TUT";
    else if (!oLEC.checked && !oTUT.checked && oLAB.checked) o = "LAB";
    else if (!oLEC.checked && !oTUT.checked && !oLAB.checked) {
        alert("Please select at least one component.");
        return;
    }

    const t = document.getElementById('timetable');
    while (t.lastElementChild !== t.firstElementChild) t.removeChild(t.lastElementChild);

    getTimeTable(t, s, c, o, true);
}

// get the timetable for subject s, course c, component o and display it in list t
// adder boolean defines whether or not to include the add course button
function getTimeTable(t, s, c, o, adder) {
    if (s !== "") {
        if (c !== "") {
            if (o !== "") {
                fetch(`/api/catalog/${s}/${c}/${o}`)
                .then((res) => res.json())
                .then(data => {
                    printTimetable(t, data, adder);
                })
            }
            else {
                fetch(`/api/catalog/${s}/${c}`)
                .then((res) => res.json())
                .then(data => {
                    printTimetable(t, data, adder);
                })
            }
        }
        else {
            fetch(`/api/catalog/${s}`)
                .then((res) => res.json())
                .then(data => {
                    printTimetable(t, data, adder);
            })
        }
    }
    else {
        alert("Please select a subject.");
    }
}

// print timetable at location t with schedule data
// enable the add button if adder true
function printTimetable(t, data, adder) {
    t.style.display = "block";
    if (data.error) {
        const item = document.createElement('li');
        let err = document.createTextNode(data.error);
        item.appendChild(err);
        t.appendChild(item);
    }
    else {
        data.forEach(e => {
            const item = document.createElement('li');
            let subj = document.createElement("span");
            subj.className = "subject";
            let subjData = document.createTextNode(e.subject);
            subj.appendChild(subjData);
            item.appendChild(subj);

            let cour = document.createElement("span");
            cour.className = "course";
            let courData = document.createTextNode(e.courseCode);
            cour.appendChild(courData);
            item.appendChild(cour);

            let desc = document.createElement("span");
            desc.className = "description";
            let descData = document.createTextNode(e.description);
            desc.appendChild(descData);
            item.appendChild(desc);

            let extDesc = document.createElement("div");
            extDesc.className = "ext_description";
            let extDescData = document.createTextNode(e.ext_description);
            extDesc.append(extDescData);
            item.appendChild(extDesc);


            let courseInfoTable = document.createElement("table");
            let courseInfoTitles = document.createElement("tr");

            courseInfoTable.className = "courseinfotable";
            let comp = document.createElement("td");
            comp.className = "courseinfo";
            let compData = document.createTextNode("COMPONENT");
            comp.appendChild(compData);
            courseInfoTitles.appendChild(comp);

            let sec = document.createElement("td");
            sec.className = "courseinfo";
            let secData = document.createTextNode("SECTION");
            sec.appendChild(secData);
            courseInfoTitles.appendChild(sec);

            let cn = document.createElement("td");
            cn.className = "courseinfo";
            let cnData = document.createTextNode("CLASS");
            cn.appendChild(cnData);
            courseInfoTitles.appendChild(cn);
            
            let ins = document.createElement("td");
            ins.className = "courseinfo";
            let insData = document.createTextNode("INSTRUCTOR");
            ins.appendChild(insData);
            courseInfoTitles.appendChild(ins);

            let req = document.createElement("td");
            req.className = "courseinfo req";
            let reqData = document.createTextNode("REQUISITES/CONSTRAINTS");
            req.appendChild(reqData);
            courseInfoTitles.appendChild(req);

            let day = document.createElement("td");
            day.className = "courseinfo";
            let dayData = document.createTextNode("DAYS");
            day.appendChild(dayData);
            courseInfoTitles.appendChild(day);

            let tm = document.createElement("td");
            tm.className = "courseinfo";
            let tmData = document.createTextNode("TIMES");
            tm.appendChild(tmData);
            courseInfoTitles.appendChild(tm);

            let loc = document.createElement("td");
            loc.className = "courseinfo";
            let locData = document.createTextNode("LOCATION");
            loc.appendChild(locData);
            courseInfoTitles.appendChild(loc);

            let camp = document.createElement("td");
            camp.className = "courseinfo";
            let campData = document.createTextNode("CAMPUS");
            camp.appendChild(campData);
            courseInfoTitles.appendChild(camp);

            let stat = document.createElement("td");
            stat.className = "courseinfo";
            let statData = document.createTextNode("STATUS");
            stat.appendChild(statData);
            courseInfoTitles.appendChild(stat);

            if (adder) {
                let add = document.createElement("td");
                add.className = "courseinfo";
                let addData = document.createTextNode("ADD");
                add.appendChild(addData);
                courseInfoTitles.appendChild(add);
            }

            courseInfoTable.appendChild(courseInfoTitles);
            
            // throw in loop just in case other course components are added to sample data
            e.courseInfo.forEach(c => {
                let courseInfo = document.createElement("tr");

                let compVal = document.createElement("td");
                if (c.ssr_component === "LEC") {
                    compVal.className = "courseinfovalue compLEC";
                }
                else if (c.ssr_component === "TUT") {
                    compVal.className = "courseinfovalue compTUT";
                }
                else {
                    compVal.className = "courseinfovalue compLAB";
                }
                let compDataVal = document.createTextNode(c.ssr_component);
                compVal.appendChild(compDataVal);
                courseInfo.appendChild(compVal);

                let secVal = document.createElement("td");
                secVal.className = "courseinfovalue";
                let secDataVal = document.createTextNode(c.class_section);
                secVal.appendChild(secDataVal);
                courseInfo.appendChild(secVal);

                let cnVal = document.createElement("td");
                cnVal.className = "courseinfovalue";
                let cnDataVal = document.createTextNode(c.class_nbr);
                cnVal.appendChild(cnDataVal);
                courseInfo.appendChild(cnVal);

                let insVal = document.createElement("td");
                insVal.className = "courseinfovalue";            
                let insDataVal = document.createTextNode(c.instructors);
                insVal.appendChild(insDataVal);
                courseInfo.appendChild(insVal);

                let reqVal = document.createElement("td");
                reqVal.className = "courseinfovalue req";
                let reqDataVal;
                if (c.descr === "" && c.descrlong === "") reqDataVal = document.createTextNode(" ");
                else if (c.descr !== "" && c.descrlong === "") reqDataVal = document.createTextNode(c.descr);
                else reqDataVal = document.createTextNode(c.descrlong);
                reqVal.appendChild(reqDataVal);
                courseInfo.appendChild(reqVal);

                let dayVal = document.createElement("td");
                dayVal.className = "courseinfovalue";
                let dayDataVal = document.createTextNode(c.days);
                dayVal.appendChild(dayDataVal);
                courseInfo.appendChild(dayVal);

                let tmVal = document.createElement("td");
                tmVal.className = "courseinfovalue";
                let tmDataVal = document.createTextNode(`${c.start_time} - ${c.end_time}`);
                tmVal.appendChild(tmDataVal);
                courseInfo.appendChild(tmVal);

                let locVal = document.createElement("td");
                locVal.className = "courseinfovalue";
                let locDataVal = document.createTextNode(c.facility_ID);
                locVal.appendChild(locDataVal);
                courseInfo.appendChild(locVal);

                let campVal = document.createElement("td");
                campVal.className = "courseinfovalue";
                let campDataVal = document.createTextNode(c.campus);
                campVal.appendChild(campDataVal);
                courseInfo.appendChild(campVal);

                let statVal = document.createElement("td");
                statVal.className = "courseinfovalue";
                let statDataVal = document.createTextNode(c.enrl_stat);
                statVal.appendChild(statDataVal);
                courseInfo.appendChild(statVal);

                if (adder) {
                    let addVal = document.createElement("td");
                    addVal.className = "courseinfovalue add";
                    addVal.onclick = function() { addToSched(e.subject, e.courseCode); }
                    let addDataVal = document.createTextNode("+");
                    addVal.appendChild(addDataVal);
                    courseInfo.appendChild(addVal);
                }

                courseInfoTable.appendChild(courseInfo);
            })
            item.appendChild(courseInfoTable);
            t.appendChild(item);
        })
    }
}

// show component area when course is selected
function showComponent() {
    const c = document.getElementById('selectCourse').value;
    const o = document.getElementById('selectComponent');
    if (c === "") {
        o.style.display = "none";
    }
    else {
        o.style.display = "block";
    }
}

// switch to search mode if "build draft" is selected
function searchMode() {
    search.style.display = "block";
    saved.style.display = "none";
    buildSel.className = "selected";
    savedSel.className = "";
}

// switch to saved mode if "access saved draft" is selected
function savedMode() {
    search.style.display = "none";
    saved.style.display = "block";
    buildSel.className = "";
    savedSel.className = "selected";
}

// add course to schedule
function addToSched(subj, cour) {
    const b = document.getElementById('builder');
    b.style.display = "block";
    let courseExists = 0;

    const bd = document.getElementById('builderData');

    schedBuilder.courses.forEach(e => {
        if (e.subject === subj && e.courseCode === cour) courseExists++;
    })

    if (courseExists === 0) {
        schedBuilder.courses.push( { subject: subj, courseCode: cour } );
        
        const e = document.createElement('li')
        const s = document.createElement('span');
        const sData = document.createTextNode(subj);
        s.className = "subject";
        s.appendChild(sData);
        e.appendChild(s);

        const c = document.createElement('span');
        const cData = document.createTextNode(cour);
        c.className = "course";
        c.appendChild(cData);
        e.appendChild(c);

        bd.appendChild(e);
    }
    else {
        alert("This courses already exists in the schedule.");
    }
}
