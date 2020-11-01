const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = express.Router({ mergeParams: true });

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    db.get('SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId',
        {
            $timesheetId: timesheetId
        },
        (error, timesheet) => {
            if (error) {
                next(error);
            } else if (timesheet) {
                req.timesheet = timesheet;
                next();
            } else {
                res.status(404).send();
            }
        }
    );
});

timesheetsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
    const values = { $employeeId: req.params.employeeId };

    db.all(sql, values, (error, timesheets) => {
        if (error) {
            next(error);
        } else {
              res.status(200).send({ timesheets: timesheets });    
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;

    if(!hours || !rate || !date || !employeeId) {
        return res.status(400).send();
    }

    const sql = 'INSERT INTO Timesheet(hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
    const values = { $hours: hours, $rate: rate, $date: date, $employeeId: employeeId };

    db.run(sql, values, function(error) {
        if(error) {
            next(error);
        } else {
            db.get('SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId', 
            {
                $timesheetId: this.lastID
            },
            (error, timesheet) => {
                res.status(201).json({ timesheet: timesheet });
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    const timesheetId = req.params.timesheetId;

    if(!hours || !rate || !date || !employeeId) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId';
    const values = { $hours: hours, $rate: rate, $date: date, $employeeId: employeeId, $timesheetId: timesheetId };

    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${timesheetId}`, (error, timesheet) => {
                res.status(200).json({ timesheet: timesheet });
            });
        }
    });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = { $timesheetId: req.params.timesheetId };
    
    db.run(sql, values, (error) => {
        if(error){
            next(error);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = timesheetsRouter;