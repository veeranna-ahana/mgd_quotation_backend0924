const sigmancRouter = require("express").Router();
var createError = require('http-errors');

const { misQueryMod, setupQuery, slsQueryMod } = require('../helpers/dbconn');
const e = require("express");
const axios = require('axios');
const { logger } = require("../helpers/logger");

sigmancRouter.post('/getschedulelist', async (req, res, next) => {
    console.log("Sigma NC getschedulelist");
    try {
        console.log(req.body.schStatus);
        let schstats = req.body.schStatus;

        //  if (intSchId == 0){
        switch (schstats) {
            case "Production":
                console.log("Production")
                misQueryMod(`SELECT c.dwgloc,c.cust_name ,o.Order_No,o.OrdSchNo,o.PO, 
                    o.ScheduleDate, o.Delivery_Date, o.ScheduleID,o.Schedule_Status,o.ScheduleType, 
                    o.Special_Instructions,o.cust_Code FROM magodmis.orderschedule o, magodmis.Cust_data c 
                    WHERE  o.cust_code=c.cust_code AND o.Type='Profile' AND (o.Schedule_Status='Tasked' or 
                    o.Schedule_Status='Processing' or o.Schedule_Status='Programmed' 
                    or o.Schedule_Status='Production')`, (err, data) => {
                    res.send(data)
                });
                break;
            case "Tasked":
                //   console.log("Tasked")
                misQueryMod(`SELECT c.dwgloc,c.cust_name ,o.Order_No,o.OrdSchNo,o.PO, 
                    o.ScheduleDate, o.Delivery_Date, o.ScheduleID,o.Schedule_Status,o.ScheduleType, 
                    o.Special_Instructions,o.cust_Code FROM magodmis.orderschedule o, magodmis.Cust_data c 
                    WHERE  o.cust_code=c.cust_code AND o.Type='Profile' AND o.Schedule_Status='Tasked'`, (err, data) => {
                    if (err) console.log(err);
                    res.send(data)
                });
                break;
            default:
                console.log("Default")
                misQueryMod(`SELECT c.dwgloc,c.cust_name,o.Order_No,o.OrdSchNo,o.PO,
                o.ScheduleDate, o.Delivery_Date,o.ScheduleID,o.Schedule_Status,o.ScheduleType, o.Special_Instructions,o.cust_Code
                FROM magodmis.orderschedule o, magodmis.Cust_data c 
                WHERE  o.cust_code=c.cust_code and o.Schedule_Status='${schstats}' AND o.Type='Profile'`, (err, data) => {
                    if (err) console.log(err);
                    console.log(data);
                    res.send(data)
                });
                break;
        }
        // } else {
        //     misQueryMod(`SELECT c.dwgloc,c.cust_name,o.Order_No,o.OrdSchNo,o.PO,
        // 	o.ScheduleDate, o.Delivery_Date,o.ScheduleID,o.Schedule_Status,o.ScheduleType, o.Special_Instructions 
        // 	FROM magodmis.orderschedule o, magodmis.Cust_data c 
        //     WHERE  o.cust_code=c.cust_code and o.ScheduleID = ${ScheduleID AND o.`Type`='Profile'`, (err, data) => {
        //         res.send(data)
        //     });
        // }
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/addstock', async (req, res, next) => {
    console.log("Sigma NC - Material addstock");
    try {
        let newmtrl = req.body.newdata;
        console.log(newmtrl);
        // if (newmtrl.length > 0) {
        for (let i = 0; i < newmtrl.length; i++) {
            //     newmtrl.foreach((mtrl,index) => {
            misQueryMod(`INSERT INTO magodmis.task_material_list(TaskNo ,  NcTaskId, Length, Width, Quantity)
                    values('${newmtrl[i].TaskNo}' ,'${newmtrl[i].NcTaskId}','${newmtrl[i].Length}','${newmtrl[i].Width}','${newmtrl[i].Qty}')`, (err, data) => {
                if (err) console.log(err);
                if (data.affectedRows > 0) {
                    misQueryMod(`SELECT * FROM magodmis.task_material_list where TaskNo='${newmtrl[i].TaskNo}'`, (err, data) => {
                        if (err) console.log(err);
                        res.send({ data, status: "Added" })
                    });

                }
            });
        }
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/invokesigmanest', async (req, res, next) => {
    try {

    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/gettaskprogramlist', async (req, res, next) => {
    console.log("Sigma NC gettaskprogramlist")
    try {
        console.log(req.body.scheduleid);
        let schid = req.body.scheduleid;
        misQueryMod(`SELECT n.* FROM magodmis.ncprograms n, magodmis.nc_task_list t 
        WHERE n.TaskNo = t.TaskNo AND t.Scheduleid= '${req.body.scheduleid}'`, (err, data) => {
            if (err) console.log(err);
            console.log(data);
            res.send(data);
        });
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post(`/getcreatedxfws`, async (req, res, next) => {
    console.log("************************  Get Create Dxf WS *******************************")
    try {

        const ordno = req.body.ordNo;
        const custnm = req.body.custnm;
        const custcd = req.body.custcd;
        let btntyp = req.body.btntype;
        let dType = req.body.doctype + "|" + req.body.custnm; // + "|" + req.body.custcd;
        console.log("Order No : " + ordno);
        console.log("Customer Name : " + custnm);
        console.log("Button Type : " + btntyp);
        console.log("Document Type : " + dType);


        axios.post(process.env.ESTAPI_URL, {
            // axios.post("http://192.168.29.123:25125/post", {

            quotationNo: req.body.ordNo.toString(),
            documentType: dType,
            readOption: btntyp

        })
            .then((response) => {
                try {
                    misQueryMod(`SELECT * FROM magodmis.orderscheduledetails where Order_No = '${ordno}' And Cust_Code= '${custcd}'`, (err, data) => {
                        if (err) logger.error(err);
                        console.log(data);
                        res.send(data)
                    })
                    // qtnQueryMod(`SELECT p.*,q.* FROM magodqtn.qtn_profiledetails p
                    // left outer join magodqtn.qtntasklist q on q.QtnTaskID = p.QtnTaskId
                    //  where p.QtnID = ${QuoteId}`, (err, data) => {
                    // qtnQueryMod(`SELECT q.* FROM magodqtn.qtntasklist q
                    //          where q.QtnID = ${QuoteId}`, (err, data) => {
                    //   if (err) logger.error(err);
                    console.log("********** Create DXF WS from Sigma NC **************");
                    //     console.log(data);
                    //     res.send(data)
                    // })
                } catch (error) {
                    next(error)
                }
                //   console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            })


        //  res.send(qtniddata.QtnID);
        //        })
    }
    catch (error) {
        next(error)
    }
});

sigmancRouter.post('/updateordscheduleparts', async (req, res, next) => {
    try {
        console.log("Sigma NC updateordscheduleparts");
        console.log(req.body);
        let schparts = req.body.nctaskPartslist;


        //  schPart.UnitWt = taskPart.Unit_Wt
        //         schPart.LOC = taskPart.LOC
        //         schPart.Part_Area = taskPart.Part_Area
        //         schPart.Holes = taskPart.Pierces

        misQueryMod(`update magodmis.orderscheduledetails set Schedule_Status='${schstatus}' where ScheduleID = '${schid}'`, (err, data) => {
            console.log(err);
            console.log(data);
            res.send(data)
        });

    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/readwsforupdate', async (req, res, next) => {
    console.log("Sigma NC readwsforupdate");
    try {
        const ordno = req.body.ordNo;
        const custnm = req.body.cust;

        let btntyp = req.body.btntype;
        let dType = req.body.doctype + "|" + req.body.cust + "|" + req.body.btntype;
        console.log("Order No : " + ordno);
        console.log("Customer Name : " + custnm);
        console.log("Button Type : " + btntyp);
        console.log("Document Type : " + dType);


        axios.post(process.env.ESTAPI_URL, {
            // axios.post("http://192.168.29.123:25125/post", {

            orderNo: req.body.ordNo.toString(),
            documentType: dType
            //   readOption : btntyp,

        })
            .then((response) => {
                try {
                    // qtnQueryMod(`SELECT p.*,q.* FROM magodqtn.qtn_profiledetails p
                    // left outer join magodqtn.qtntasklist q on q.QtnTaskID = p.QtnTaskId
                    //  where p.QtnID = ${QuoteId}`, (err, data) => {
                    // qtnQueryMod(`SELECT q.* FROM magodqtn.qtntasklist q
                    //          where q.QtnID = ${QuoteId}`, (err, data) => {
                    //   if (err) logger.error(err);
                    console.log("********** Create DXF WS from Sigma NC **************");
                    //     console.log(data);
                    //     res.send(data)
                    // })
                } catch (error) {
                    next(error)
                }
                //   console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            })


        //  res.send(qtniddata.QtnID);
        //        })
    }
    catch (error) {
        next(error)
    }

});

sigmancRouter.post('/getmateriallistdata', async (req, res, next) => {
    console.log("Sigma NC getmateriallistdata");
    try {
        console.log(req.body);
        let nctskId = req.body.nctaskid;
        // let mtrlcode = req.body.mtrlcode;

        await misQueryMod(`Select m.DynamicPara1, m.DynamicPara2, count(m.MtrlStockID) as Qty From magodmis.mtrlstocklist m,
        magodmis.nc_task_list n Where  n.Mtrl_Code = m.Mtrl_Code AND m.cust_code = if(n.CustMtrl='magod','0000',n.Cust_code) 
        AND n.NcTaskId = '${nctskId}' AND m.Locked = 0 GROUP BY m.DynamicPara1, m.DynamicPara2`, async (err, data) => {
            if (err) console.log(err);
            console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/gettaskscheduledetails', async (req, res, next) => {
    try {
        //        console.log(req.body.scheduleid);
        let schid = req.body.scheduleid;
        //      console.log(schid);
        misQueryMod(`SELECT * FROM magodmis.nc_task_list WHERE scheduleid='${schid}'`, (err, data) => {
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/gettaskmtrllist', async (req, res, next) => {
    console.log("Sigma NC gettaskmtrllist")
    const schid = req.body.scheduleid;
    console.log(schid);
    try {
        misQueryMod(`SELECT t.* FROM magodmis.task_material_list t
                     inner join magodmis.nc_task_list n on n.NcTaskId = t.NcTaskId
                     WHERE n.ScheduleID= '${schid}'`, (err, data) => {
            if (err) logger.error(err);
            console.log("136 - gettaskmtrllist");
            console.log(data);
            // misQueryMod(`SELECT m.DynamicPara1, m.DynamicPara2 , count(m.MtrlStockID) as Qty 
            // FROM magodmis.mtrlstocklist m, magodmis.nc_task_list n 
            // WHERE  n.Mtrl_Code=m.Mtrl_Code AND m.cust_code=if(n.CustMtrl='magod','0000',n.Cust_code) 
            // AND n.NcTaskId= '${data[0].nctaskId} AND m.Locked= 0 
            // GROUP BY m.DynamicPara1, m.DynamicPara2`, (err, mtrldata) => {
            //     console.log(mtrldata);
            res.send(data);
            // });
        })


    } catch (error) {
        next(error)
    }
});

sigmancRouter.post(`/getmaterialnestarea`, async (req, res, next) => {

    try {
        console.log("Sigma NC getmaterialnestarea");
        console.log(req.body);
        let ncpgmno = req.body.NCProgramNo;
        console.log(ncpgmno);
        misQueryMod(`SELECT Case WHEN .95<round(sum( n1.Qtynested * t.part_area),0) / n.NetNestArea
    and round(sum( n1.Qtynested * t.part_area),0) / n.NetNestArea <1.05 then true 
    WHEN n.NetNestArea <100 then true else false end as permit
    FROM magodmis.ncprograms n, magodmis.ncprogram_partslist n1, magodmis.task_partslist t
    WHERE n1.NCId = n.Ncid AND t.Task_Part_ID = n1.Task_Part_Id  AND n.NCProgramNo =${ncpgmno}`, (err, data) => {
            console.log(data);
            res.send(data)
        });

    } catch (error) {
        next(error)
    }

});

sigmancRouter.post('/deleteprogram', async (req, res, next) => {
    try {
        console.log(req.body);
        let NCid = req.body.Ncid;
        // let ordsch = req.body.Ordscheduleid;
        console.log(NCid);
        await misQueryMod(`delete from magodmis.ncprogram_partslist WHERE NCid = '${NCid}'`, async (err, data) => {
            console.log(err);
            console.log(data);
            await misQueryMod(`delete from magodmis.ncprograms WHERE NCid = '${NCid}'`, async (err, data) => { });
        });
        res.send("Deleted");
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/getmtrlavailibility', async (req, res, next) => {
    try {
        const nctaskId = req.body.nctaskid;
        await misQueryMod(`SELECT m.DynamicPara1, m.DynamicPara2 , count(m.MtrlStockID) as Qty 
    FROM magodmis.mtrlstocklist m, magodmis.nc_task_list n 
    WHERE  n.Mtrl_Code=m.Mtrl_Code AND m.cust_code=if(n.CustMtrl='magod','0000',n.Cust_code) 
    AND n.NcTaskId= '${nctaskId}' AND m.Locked= 0 
    GROUP BY m.DynamicPara1, m.DynamicPara2`, async (err, data) => {
            console.log(data);
            res.send(data)
        });

    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/getnctasklist', async (req, res, next) => {
    try {
        //        console.log(req.body.ScheduleId);
        let schid = req.body.schId;
        console.log(schid);
        misQueryMod(`SELECT * FROM magodmis.nc_task_list WHERE ScheduleID='${schid}'`, (err, data) => {
            //            console.log(err);
            //            console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});


sigmancRouter.post('/getncprogramtaskparts', async (req, res, next) => {
    console.log("Sigma NC getncprogramtaskparts")
    try {
        let ncprograms = req.body.ncprogramnos;
        let schid = req.body.SchId;

        console.log(ncprograms);
        console.log("ncprograms Length : " + ncprograms.length);
        for (let i = 0; i < ncprograms.length; i++) {
            console.log("inside for loop");
            console.log(ncprograms[i]["NCProgramNo"])
            //await misQueryMod(`select * from ncprogram_partslist where NcProgramNo='${ncprograms[i].NCProgramNo}'`, (err, data) => {

            await misQueryMod(`SELECT t.*,n.Mprocess,n.mtrl_code FROM magodmis.task_partslist t
                inner join magodmis.nc_task_list n on t.TaskNo=n.taskno
                WHERE n.Scheduleid='${schid}'`, (err, data) => {
                console.log(err);
                console.log(data);
                res.send(data)
            });
        }
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post(`/getncpgmpartslist`, async (req, res, next) => {
    try {
        console.log("Sigma NC getncpgmpartslist");
        console.log(req.body);
        let schid = req.body.SchId;

        misQueryMod(`SELECT n.* FROM magodmis.ncprogram_partslist n
        inner join  magodmis.nc_task_list n1 on n1.TaskNo=n.TaskNo
        WHERE   n1.ScheduleID='${schid}'`, (err, data) => {
            console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/getnctaskparts', async (req, res, next) => {
    try {
        console.log(req.body.ScheduleId);
        let schid = req.body.ScheduleId;
        console.log(schid);
        misQueryMod(`SELECT t.*,n.Mprocess,n.mtrl_code FROM magodmis.task_partslist t,magodmis.nc_task_list n 
            WHERE  t.TaskNo=n.taskno And  n.ScheduleID='${schid}'`, (err, data) => {
            console.log(err);
            console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});


sigmancRouter.post('/getprogramlistdata', async (req, res, next) => {
    try {
        console.log(req.body.ScheduleId);
        let schid = req.body.ScheduleId;
        console.log(schid);
        misQueryMod(`SELECT n.* FROM magodmis.ncprograms n, magodmis.nc_task_list t 
        WHERE n.TaskNo=t.TaskNo AND t.ScheduleID='${schid}'`, (err, data) => {
            console.log(err);
            console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});


sigmancRouter.post('/updateprogramstatus', async (req, res, next) => {
    try {
        console.log("updateprogramstatus");
        //    console.log(req.body);
        let NCid = req.body.Ncid;
        let ordsch = req.body.Ordscheduleid;
        //      console.log(NCid);
        misQueryMod(`update magodmis.ncprograms set PStatus='Mtrl Issue' where Ncid = '${NCid}'`, (err, data) => {
            console.log(err);
            //       console.log(data);

        });
        misQueryMod(`SELECT n.* FROM magodmis.ncprograms n, magodmis.nc_task_list t 
            WHERE n.TaskNo=t.TaskNo AND t.ScheduleID='${ordsch}'`, (err, tdata) => {
            console.log(err);
            //         console.log(tdata);
            res.send(tdata)
        });

        // misQueryMod(`SELECT n.* FROM magodmis.ncprograms n, magodmis.nc_task_list t 
        // WHERE n.TaskNo=t.TaskNo AND n.Ncid = '${NCid}'`,(err,tdata) => {
        //     console.log(err);
        //     console.log(tdata);
        //     res.send(tdata)
        // });
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/savencprogramdetails', async (req, res, next) => {
    console.log("Sigma NC savencprogramdetails");
    try {
        const mchine = req.body.machine;
        const nctskno = req.body.taskno;
        console.log("Machine : " + mchine);
        console.log("Task No : " + nctskno);
        await misQueryMod(`Select * from magodmis.nc_task_list where TaskNo='${nctskno}'`, async (err, data) => {
            if (err) console.log(err);
            if (data.length > 0) {
                await misQueryMod(`update magodmis.nc_task_list set Machine='${mchine}' where TaskNo='${nctskno}'`, async (err, data) => {
                    if (err) console.log(err);
                    await misQueryMod(`Select * from magodmis.nc_task_list where TaskNo='${nctskno}'`, async (err, data) => {
                        if (err) console.log(err);
                        console.log(data);
                        res.send(data);
                    });
                });
            }
        });
    } catch (error) {
        next(error)
    }
});

// Get All Machine Data
sigmancRouter.post('/allmachines', async (req, res, next) => {
    try {
        misQueryMod("Select * from magodmis.machinedb order by MachineID asc", (err, data) => {
            console.log(data)
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});

//magodmis.task_partslist

sigmancRouter.post('/getnctaskpartslist', async (req, res, next) => {
    try {
        console.log(req.body.ncprogramnos);
        let schid = req.body.ncprogramnos;
        console.log(schid);
        misQueryMod(`SELECT t.* FROM magodmis.ncprogram_partslist t WHERE  t.NcProgramNo ='${schid}'`, (err, data) => {
            console.log(err);
            //      console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/getnctaskpartslist', async (req, res, next) => {
    try {
        console.log(req.body.ncprogramnos);
        let schid = req.body.ncprogramnos;
        console.log(schid);
        misQueryMod(`SELECT t.* FROM magodmis.ncprogram_partslist t WHERE  t.NcProgramNo ='${schid}'`, (err, data) => {
            console.log(err);
            //      console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/getnctaskpartslistbytaskid', async (req, res, next) => {
    try {
        console.log(req.body.nctaskid);
        let nctaskid = req.body.nctaskid;
        console.log(nctaskid);
        misQueryMod(`SELECT * FROM magodmis.task_partslist where NcTaskId ='${nctaskid}'`, (err, data) => {
            console.log(err);
            //      console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});

sigmancRouter.post('/getmtrlavailability', async (req, res, next) => {
    try {
        console.log(req.body);
        let ccode = req.body.ccode;
        let mtrlcode = req.body.mtrl;
        console.log(ccode);
        misQueryMod(`SELECT  m.DynamicPara1 as Length, m.DynamicPara2 as Width,
        count( m.MtrlStockID) as stockQty FROM magodmis.mtrlstocklist m 
        WHERE m.Cust_Code='${ccode}' AND m.Mtrl_Code='${mtrlcode}' AND m.Locked=0 AND m.Scrap=0 
        GROUP BY m.Mtrl_Code, m.Cust_Code, m.DynamicPara1, m.DynamicPara2`, (err, data) => {
            console.log(err);
            console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});



module.exports = sigmancRouter;