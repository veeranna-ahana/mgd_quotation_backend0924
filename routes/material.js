const materialRouter = require("express").Router();
var createError = require('http-errors');
const { logger } = require("../helpers/logger");
const { misQueryMod, setupQuery } = require('../helpers/dbconn');
const { loggers } = require("winston");

materialRouter.post('/allmaterials', async (req, res, next) => {
    try {
        // misQueryMod("Select * from magodmis.mtrl_data order by Mtrl_Code asc", (err, data) => {
        misQueryMod(`Select mtl.*,mg.Grade, mg.Specific_Wt from magodmis.mtrl_data mtl  
                    inner join magodmis.mtrlgrades mg on mg.MtrlGradeID = mtl.MtrlGradeID order by Mtrl_Code asc`, (err, data) => {
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});

materialRouter.post(`/getmtrldetsbymtrlcode`, async (req, res, next) => {
    try {
        console.log(req.body.mtrlcode);
        misQueryMod(`Select mtl.*,mg.Grade, mg.Specific_Wt from magodmis.mtrl_data mtl  
                    inner join magodmis.mtrlgrades mg on mg.MtrlGradeID = mtl.MtrlGradeID 
                    where mtl.Mtrl_Code = '${req.body.mtrlcode}' Order By Mtrl_Code asc`, (err, data) => {
            if (err) logger.error(err);
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});

materialRouter.post('/getmtrldetailsbycode', async (req, res, next) => {
    try {
        console.log("*********************getmtrldetailsbycode *********************");
        let mtrldata = [];
        const mtrls = req.body.mtrlcodes;
        const placeholders = ', '.join(['%s'] * len(mtrl_values));
console.log(mtrls);
        misQueryMod(`SELECT  mtl.Mtrl_Code,mtl.SpecificWt,mtl.Grade,mtl.Mtrl_Type,mtl.Thickness from magodmis.mtrl_data mtl 
            where mtl.Mtrl_Code IN (${placeholders}) Order By Mtrl_Code asc`, (err, data) => {
            // ('${mtrls.join("','")}') Order By Mtrl_Code asc`, (err, data) => {
            if (err){
                logger.error(err);
                throw createError(err);
            };
            res.send(data);
        })
    } catch (error) {
        next(error)
    }
});

materialRouter.get('/getmtrldetails', async (req, res, next) => {
    try {
        console.log("mtrldetails")
        misQueryMod("Select Concat(Shape,' ',MtrlGradeID) as Material from magodmis.mtrl_data where shape='Units' order by MtrlGradeID asc", (err, data) => {
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});

materialRouter.get('/getmtrllocation', async (req, res, next) => {
    try {
        setupQuery(`SELECT * FROM magod_setup.material_location_list where StorageType="Units"`, (data) => {
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});


module.exports = materialRouter