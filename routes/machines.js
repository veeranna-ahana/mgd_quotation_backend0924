const machineRouter = require("express").Router();
var createError = require('http-errors');

const { mchQueryMod } = require('../helpers/dbconn');

machineRouter.get('/allmachines', async (req, res, next) => {
    try {
        mchQueryMod("Select * from magodmis.machinedb order by MachineID asc", (err,data) => {
            console.log(data)
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});

module.exports = machineRouter;