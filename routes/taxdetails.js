const taxdbRouter = require("express").Router();
var createError = require('http-errors');

const { misQuery, misQueryMod } = require('../helpers/dbconn');

taxdbRouter.post('/alltaxdetails', async (req, res, next) => {
    //   console.log("Taxes Data");
    //  console.log(req.body)
    try {
        const qtype = req.body.qtntype;
        await misQueryMod(`SELECT TaxName,Tax_Percent FROM magod_setup.taxdb where current_date() >= EffectiveFrom and current_date() <= EffectiveTO 
                           order by TaxID asc`, (err, data) => {
            if (err) console.log(err)
            console.log(data);
            res.send(data);
        });


        // switch (qtype) {
        //     case 'Service': {
        //         //   if (qtype == 'Service') {
        //         misQueryMod("SELECT TaxName,Tax_Percent FROM magod_setup.taxdb where current_date() >= EffectiveFrom and current_date() <= EffectiveTO And Service = 1 order by TaxID asc", (err, data) => {
        //             if (err) console.log(err)
        //             console.log(data);
        //             res.send(data);
        //         });
        //         break;
        //     }
        //     case 'Sales': {
        //         //    } else if (qtype == 'Sales') {

        //         misQueryMod("SELECT TaxName,Tax_Percent FROM magod_setup.taxdb where current_date() >= EffectiveFrom and current_date() <= EffectiveTO And Sales = 1 order by TaxID asc", (err, data) => {
        //             if (err) console.log(err)
        //             console.log(data);
        //             res.send(data);
        //             //   console.log(data);
        //         });
        //         break;
        //     }
        //     case 'JobWork': {
        //         //} else if (qtype == 'JobWork') {
        //         misQueryMod("SELECT TaxName,Tax_Percent FROM magod_setup.taxdb where current_date() >= EffectiveFrom and current_date() <= EffectiveTO And JobWork = 1 order by TaxID asc", (err, data) => {
        //             if (err) console.log(err)
        //             console.log(data);
        //             res.send(data);
        //         });
        //         break;
        //     }
        // }
    } catch (error) {
        next(error)
    }
});



module.exports = taxdbRouter;