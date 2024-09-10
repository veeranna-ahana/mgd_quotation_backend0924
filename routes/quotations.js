const moment = require('moment');
const quoteRouter = require("express").Router();
const fs = require('fs');
var createError = require('http-errors')

const axios = require('axios');
const { setupQuery, qtnQuery, qtnQueryMod, qtnQueryModv2, misQueryMod, qtnQueryPromise, misQueryPromise } = require('../helpers/dbconn');
const { createFolder, writetofile } = require('../helpers/folderhelper');
const { logger } = require("../helpers/logger");
const e = require('express');
const { quotationStartPage } = require('../helpers/mailtemplate');
const { sendQuotation } = require('../helpers/sendmail');
//const PoolCluster = require('mysql2/typings/mysql/lib/PoolCluster');
let enquiryDate = new Date();


quoteRouter.post(`/quotation`, async (req, res, next) => {
    let mon = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]
    try {
        // const qtndate = new Date().toString().replaceAll("T", " ").split(".")[0];
        let zzz = new Date();
        const qtndate = zzz.getFullYear() + "-" + (zzz.getMonth() + 1).toString().padStart(2, '0') + "-" + zzz.getDate() + " " + zzz.getHours() + ":" + zzz.getMinutes() + ":" + zzz.getSeconds();
        //  if (req.body.enquiryDate == 'undefined') {
        enquiryDate = qtndate;
        // } else {
        //    enquiryDate = moment(req.body.enquiryDate).format("YYYY-MM-DD HH:mm:ss");
        // }

        console.log(req.body);

        const enquiryRef = req.body.enquiryRef;
        const customerName = req.body.customerName;
        const custAddress = req.body.custAddress.replaceAll("\r\n", "");
        const custcode = req.body.custcode;
        const custTele = req.body.custTele;
        const contact = req.body.contact;
        const e_mail = req.body.e_mail;
        const qtnformat = req.body.formformat;
        const qtnstatus = req.body.qtnstatus;

        qtnQuery("SELECT *  FROM magod_setup.magod_runningno WHERE SrlType='Quotation' ORDER BY Id DESC LIMIT 1;", async (runningno) => {
            let month = new Date(Date.now()).toLocaleString('en-US', { month: 'long' })
            let qno = new Date().getFullYear().toString() + "_" + (new Date().getMonth() + 1).toString().padStart(2, '0') + '_' + (parseInt(runningno[0]["Running_No"]) + 1).toString().padStart(3, '0')
            await createFolder('Quotation', qno, month); // To Create folder at server side

            qtnQuery(`Insert into magodqtn.qtnlist (QtnNo,EnquiryDate,QtnDate,Cust_Code,CustomerName,CustAddress,CustTele,EnquiryRef,Contact,E_mail,QtnFormat,QtnStatus)
                    values ('${qno.replaceAll("_", "/")}', '${qtndate}','${qtndate}','${custcode}', '${customerName}', '${custAddress}', '${custTele}',
                    '${enquiryRef}', '${contact}', '${e_mail}', '${qtnformat}', '${qtnstatus}')`, (ins) => {
                console.log(ins)
                if (ins.affectedRows == 1) {
                    qtnQuery(`UPDATE magod_setup.magod_runningno SET Running_No = Running_No + 1 WHERE SrlType='Quotation' 
                                And Id = ${runningno[0]["Id"]}`, async (updatedrunning) => {
                        console.log(`Updated running No ${JSON.stringify(updatedrunning)}`)
                    })
                }
                // To Copy the files from customer dwgs to qtndrawings qtn folder.
            })

            res.send({ quotationno: qno })
        });


        //let month = mon[new Date().getMonth()]


        // to update table runningno = runningno + 1

    } catch (error) {
        next(error)
    }
});

// ********** Suresh
quoteRouter.post('/updateprofiledetails', async (req, res, next) => {
    console.log('*** Suresh *** updateprofiledetails')
    try {
        console.log(req.body);
        const qtnno = req.body.quotationno;
        const tasklstdet = req.body.tasklst;
        const filname = req.body.fname;

        console.log("from b4 estimation task selector saving wts : " + filname);
        console.log(req.body.tasklst);
        // const qno = qtnno.replaceAll("_", "/");
        //   console.log(qno);
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);

        for (let i = 0; i < tasklstdet.length; i++) {

            qtnQueryMod(`UPDATE magodqtn.qtn_profiledetails SET PartNetArea = '${tasklstdet[i]["partNetArea"]}',LOC='${tasklstdet[i]["lengthOfCut"]}',
                         NoofPierces = '${tasklstdet[i]["noOfPierces"]}',OutOpen='${(tasklstdet[i]["outOpen"] == 0 ? 0 : -1)}',PartNetWt='${tasklstdet[i]["partNetWeight"]}',PartOutArea='${tasklstdet[i]["partOutArea"]}',
                         PartOutWt='${tasklstdet[i]["partOutWeight"]}',Complexity='${tasklstdet[i]["complexity"]}',RectWeight='${tasklstdet[i]["rectWeight"]}',
                         Unit_JobWork_Cost = '${(tasklstdet[i]["jwcost"] > 0 ? tasklstdet[i]["jwcost"] : 0)}',
                         Unit_Material_Cost = '${(tasklstdet[i]["unitMaterialCost"] > 0 ? tasklstdet[i]["unitMaterialCost"] : 0)}'
                         WHERE QtnID = ${findQtnID[0].QtnID} And Dwg_Name = '${filname}'`, async (err, data) => {
                //   WHERE QtnID = ${qtnid} And Dwg_Name = '${tasklstdet[i]["file.name"]}'`, async (err, data) => {
                if (err) logger.error(err);

                qtnQueryMod(`UPDATE magodqtn.taskdetails SET  PartNetArea = '${tasklstdet[i]["partNetArea"]}',LOC='${tasklstdet[i]["lengthOfCut"]}',
                        NoofPierces = '${tasklstdet[i]["noOfPierces"]}',OutOpen='${(tasklstdet[i]["outOpen"] == 0 ? 0 : -1)}',PartNetWt='${tasklstdet[i]["partNetWeight"]}',PartOutArea='${tasklstdet[i]["partOutArea"]}',
                        PartOutWt='${tasklstdet[i]["partOutWeight"]}',Complexity='${tasklstdet[i]["complexity"]}',RectWeight='${tasklstdet[i]["rectWeight"]}',
                        Unit_JobWork_Cost = '${(tasklstdet[i]["jwcost"] > 0 ? tasklstdet[i]["jwcost"] : 0)}',
                        Unit_Material_Cost = '${(tasklstdet[i]["unitMaterialCost"] > 0 ? tasklstdet[i]["unitMaterialCost"] : 0)}'
                        WHERE QtnID = ${findQtnID[0].QtnID} And Dwg_Name = '${filname}'`, async (err, data) => {
                    if (err) logger.error(err);

                    // res.send({ message: "Updated Successfully" });
                });

            });
        }
        res.send({ message: "Updated Successfully" });
        //}
        //})
    } catch (error) {
        next(error)
    }
});

// *******  Suresh

quoteRouter.post(`/getquotations`, async (req, res, next) => {

    try {
        const qtnformt = req.body.qtnformat;
        console.log(qtnformt)
        //qtnQueryMod(`SELECT q.QtnID, q.QtnNo FROM magodqtn.qtnlist q  WHERE q.QtnNo is not null and q.QtnFormat='${qtnformt}'  ORDER BY q.QtnNo Desc`, async (err, data) => {
        //SELECT q.QtnID, q.QtnNo FROM magodqtn.qtnlist q  WHERE q.QtnNo is not null 
        //   and q.QtnStatus = 'Qtn Sent' and q.QtnFormat='${qtnformt}' ORDER BY q.QtnNo Desc`
        qtnQueryMod(`SELECT q.QtnID, q.QtnNo FROM magodqtn.qtnlist q  WHERE q.QtnFormat='${qtnformt}' ORDER BY q.QtnNo Desc`, async (err, data) => {
            if (err) logger.error(err);
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});


quoteRouter.post(`/getselectedquotation`, async (req, res, next) => {
    console.log('getselectedquotation')
    try {
        const qtnid = req.body.OLDQtnID;
        //  const qnno = req.body.oldQtnNo;
        console.log(req.body.OLDQtnID);
        qtnQueryMod(`SELECT *  FROM magodqtn.qtnlist where QtnID='${req.body.OLDQtnID}'`, async (err, data) => {
            if (err) logger.error(err);
            console.log(data)
            res.send(data)
        });

    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/getrevselectedquotation`, async (req, res, next) => {
    console.log('getrevselectedquotation')
    try {
        const qtnno = req.body.quotationNo;

        console.log(req.body.quotationNo);
        await qtnQueryMod(`SELECT *  FROM magodqtn.qtnlist where QtnNo='${req.body.quotationNo}'`, async (err, data) => {
            if (err) logger.error(err);
            console.log(data)
            res.send(data)
        });

    } catch (error) {
        next(error)
    }
});


// Revise Quotation
quoteRouter.post(`/getquotationalldetails`, async (req, res, next) => {
    console.log('getquotationalldetails - 127');
    try {
        const oldqtnid = req.body.OLDQtnID;
        const oldqtnno = req.body.oldQtnNo.replaceAll("_", "/");
        const QtnFormat = req.body.QtnFormat;
        let qno = "";
        await qtnQueryMod(`SELECT *  FROM magodqtn.qtnlist where QtnID='${oldqtnid}'`, async (err, qtndata) => {
            console.log("step - 1");
            console.log(qtndata);
            if (err) logger.error(err);
            await qtnQueryMod(`SELECT *  FROM magodqtn.qtn_itemslist where QtnID='${oldqtnid}'`, async (err, qtnitemsdata) => {
                console.log("step - 2");
                if (err) logger.error(err);
                await qtnQuery("SELECT *  FROM magod_setup.magod_runningno WHERE SrlType='Quotation' ORDER BY Id DESC LIMIT 1;", async (runningno) => {
                    console.log("step - 3");
                    if (err) logger.error(err);
                    await qtnQueryMod(`UPDATE magod_setup.magod_runningno SET Running_No = Running_No + 1 WHERE SrlType='Quotation' And Id = ${runningno[0]["Id"]}`, async (err, updatedrunning) => {
                        console.log("step - 4");
                        if (err) logger.error(err);
                        console.log(`Updated running No ${JSON.stringify(updatedrunning)}`)
                        await qtnQueryMod("SELECT Running_No  FROM magod_setup.magod_runningno WHERE SrlType='Quotation' ORDER BY Id DESC LIMIT 1;", async (err, runningno) => {
                            console.log("step - 5");
                            if (err) logger.error(err);
                            let month = new Date(Date.now()).toLocaleString('en-US', { month: 'long' })
                            qno = new Date().getFullYear().toString() + "_" + (new Date().getMonth() + 1).toString().padStart(2, '0') + '_' + (parseInt(runningno[0]["Running_No"]) + 1).toString().padStart(3, '0')
                            console.log(qno);
                            await createFolder('Quotation', qno, month);
                            console.log(qtndata);
                            let qtno = qno.replaceAll("_", "/");
                            await qtnQueryMod(`INSERT INTO  magodqtn.qtnlist(QtnNo,QtnFormat,EnquiryDate,QtnDate,Cust_Code,CustomerName,CustAddress,CustTele,EnquiryRef,Contact,E_mail,RevisonOf,RevQtnDate) 
                                     VALUES('${qtno}','${qtndata[0].QtnFormat}',curdate(),curdate(),'${qtndata[0].Cust_Code}','${qtndata[0].CustomerName}','${qtndata[0].CustAddress}','${qtndata[0].CustTele}','${qtndata[0].EnquiryRef}',
                                     '${qtndata[0].Contact}','${qtndata.E_mail}','${oldqtnno}',curdate())`,
                                async (err, qtnlist) => {
                                    console.log("step - 6");
                                    if (err) logger.error(err);

                                    await qtnQueryMod(`INSERT INTO magodqtn.qtn_itemslist(QtnId, Name, Material, Operation, Quantity, BasePrice, DiscountAmount) 
                                    SELECT QtnId, Name, Material, Operation, Quantity, BasePrice, DiscountAmount 
                                    FROM magodqtn.qtn_itemslist WHERE QtnId='${oldqtnid}'`, async (err, qtnitemslist) => {
                                        console.log("step - 7");
                                        if (err) logger.error(err);
                                        await qtnQueryMod(`INSERT INTO magodqtn.qtn_termsandconditions(QtnID, Under, Terms) 
                                         SELECT QtnID,Under,Terms FROM magodqtn.qtn_termsandconditions WHERE QtnId='${oldqtnid}'`, async (err, qtntermsandconditions) => {
                                            console.log("step - 8");
                                            if (err) logger.error(err);
                                            res.send({ message: "Updated Successfully", qtnno: qno })
                                        });
                                    });
                                });
                        });
                    });
                });
            });
        });
    } catch (error) {
        next(error)
    }
});



quoteRouter.post(`/getquotationtaxes`, async (req, res, next) => {
    console.log("Quotation Items ******************");
    try {

        console.log("Yes  Qtn ID taxes : " + req.body.qtnId);

        // await qtnQueryMod(`SELECT QtnID FROM magodqtn.qtnlist where QtnID = '${req.body.qtnid}'`, async (err, qtnlistdata) => {
        //     if (err) logger.error(err);
        //     console.log(qtnlistdata);
        //     let qtnid = qtnlistdata[0].QtnID;
        await qtnQueryMod(`SELECT * FROM magodqtn.qtntaxes where QtnId = '${req.body.qtnId}'`, async (err, data) => {
            if (err) logger.error(err);

            console.log(data);
            res.send(data)

        })
        // });
    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/getquotationitems`, async (req, res, next) => {
    console.log("Quotation Items ******************");
    try {

        console.log(" Get Quotation Items  Qtn ID  : " + req.body.qtnid);

        // await qtnQueryMod(`SELECT QtnID FROM magodqtn.qtnlist where QtnID = '${req.body.qtnid}'`, async (err, qtnlistdata) => {
        //     if (err) logger.error(err);
        //     console.log(qtnlistdata);
        //     let qtnid = qtnlistdata[0].QtnID;
        // await qtnQueryMod(`SELECT Name, Material, Operation, Quantity, BasePrice, DiscountAmount, Format((BasePrice - DiscountAmount),2) As FinalPrice, 
        //     Format((Quantity * (BasePrice - DiscountAmount)),2) As TotalAmount FROM magodqtn.qtn_itemslist where QtnId = '${req.body.qtnid}'`, async (err, data) => {
        await qtnQueryMod(`SELECT Name, Material, Operation, Quantity, BasePrice, DiscountAmount, (BasePrice - DiscountAmount) As FinalPrice, 
            (Quantity * (BasePrice - DiscountAmount)) As TotalAmount FROM magodqtn.qtn_itemslist where QtnId = '${req.body.qtnid}'`, async (err, data) => {

            if (err) logger.error(err);

            console.log(data);
            res.send(data)

        })
        // });
    } catch (error) {
        next(error)
    }
});


quoteRouter.post(`/getqtntaxdetails`, async (req, res, next) => {
    console.log("Tax Details Called from Find Quote");
    try {
        //   const quoteno = req.body.quotationNo;
        console.log("req tax. " + req.body.qtnid);
        const qtnid = req.body.qtnid;
        console.log("Yes Tax  Qtn ID : " + req.body.qtnid);

        if (!qtnid) throw createError.BadRequest();
        qtnQueryMod(`SELECT * FROM magodqtn.qtntaxes where QtnId = '${req.body.qtnid}'`, async (err, data) => {
            if (err) logger.error(err); // throw createError.InternalServerError(err);
            console.log("Tax Data : ");
            console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});


quoteRouter.post(`/getqtntaxdetailsbyqtnno`, async (req, res, next) => {
    console.log("Tax Details Called from Find Quote");
    try {
        //   const quoteno = req.body.quotationNo;
        console.log("req tax. " + req.body.qtnno);
        const qtnno = req.body.qtnno;
        console.log("Yes Tax  Qtn No : " + req.body.qtnno);

        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);
        console.log("getqtntaxdetailsbyqtnno - Qtn ID : " + findQtnID[0].QtnID)
        await qtnQueryMod(`SELECT * FROM magodqtn.qtntaxes where QtnID = '${findQtnID[0].QtnID}'`, async (err, data) => {
            if (err) logger.error(err); // throw createError.InternalServerError(err);
            console.log("Tax Data : ");
            console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});


quoteRouter.post(`/getqtntcdetails`, async (req, res, next) => {
    try {
        //   const quoteno = req.body.quotationNo;
        console.log("req tc. " + req.body.qtnid);
        const qtnid = req.body.qtnid;
        console.log("Yes  Qtn ID : " + qtnid);

        if (!qtnid) throw createError.BadRequest();
        qtnQueryMod(`SELECT * FROM magodqtn.qtn_termsandconditions where QtnId = '${qtnid}'`, async (err, data) => {
            if (err) throw createError.InternalServerError(err);
            else {
                console.log(data);
                res.send(data)
            }
        })
    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/updatequotationlist`, async (req, res, next) => {
    console.log("Update Quotation List");

    console.log(req.body.quoteno);
    console.log(req.body.qtnstatus);
    console.log(req.body.orderstat);
    console.log(req.body.noOrder);
    console.log(req.body.oldqtnstatus);
    console.log(req.body.qtnformat);
    try {
        console.log("Update Quotation List - 1");
        qtnQueryMod(`Update magodqtn.qtnlist set QtnStatus='${req.body.qtnstatus}',OrderStatus='${req.body.orderstat}',NoOrder='${req.body.noOrder}'
        where QtnNo='${req.body.quoteno}'`, async (err, data) => {
            if (err) logger.error(err);
            console.log("Update Quotation List - 2");

            if (data.affectedRows > 0) {
                qtnQueryMod(`Select * from magodqtn.qtnlist where QtnStatus='${req.body.oldqtnstatus}' And QtnFormat='${req.body.qtnformat}' order by Qtnid desc`, async (err, qtnlistdata) => {
                    if (err) logger.Error(err);
                    res.send(qtnlistdata)
                });
            }
            else {
                res.send({ message: "Update Failed" })
            }
        });
    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/getqtnrejnreasons`, async (req, res, next) => {
    console.log('Reasons ')
    try {
        const qtnfor = req.body.qtnfor;
        console.log(qtnfor);

        //  if (!qtnfor) res.send(createError.BadRequest())
        qtnQueryMod(`SELECT * FROM magodqtn.qtn_rejection_reasons where magodqtn.qtn_rejection_reasons.For = '${qtnfor}'`, async (err, data) => {
            if (err) logger.error(err);
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});

//SELECT * FROM magodqtn.material_rate
quoteRouter.post(`/gettaskmaterialrates`, async (req, res, next) => {
    console.log(" ********************** Material Rates - 1111 ******************************")
    try {
        //   const filtr = req.body.filter;
        // console.log(filtr);

        const mmaterial = req.body.mmatrl;
        const mgrade = req.body.filter;
        console.log(mmaterial);
        console.log(mgrade);

        //  if (!filtr) res.send(createError.BadRequest())
        qtnQueryMod(`SELECT * FROM magodqtn.material_rate where Material = '${mmaterial}' And Grade = '${mgrade}'`, async (err, data) => {
            if (err) logger.error(err);
            res.send(data)
        })
    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/getoperationmtrlratelist`, async (req, res, next) => {

    try {
        const mtrl = req.body.material;
        const opertn = req.body.process;
        const thick = req.body.dblThickness;

        console.log(opertn);
        qtnQueryMod(`SELECT * FROM magodqtn.operation_mtrl_ratelist where Material = '${mtrl}' And Operation = '${opertn}' and Thickness = ${thick} order by Thickness`, (err, opmtrldata) => {
            if (err) logger.error(err);
            console.log("Operation : " + JSON.stringify(opmtrldata));

            res.send(opmtrldata);
        })
    }
    catch (error) {
        next(error)
    }
});

// Send Quotation mail

quoteRouter.post(`/sendquotationmail`, async (req, res, next) => {
    console.log('sendquotationmail  ' + req.body.qtnno)
    try {
        const qtnno = req.body.qtnno.replaceAll("_", "/");
        await qtnQueryMod(`SELECT * FROM magodqtn.qtnlist where QtnNo = '${qtnno}'`, async (err, qtnDetails) => {
            if (err) logger.error(err);
            console.log(qtnDetails);
            await qtnQueryMod(`SELECT * FROM magod_setup.magodlaser_units where current = '1'`, async (err, unitdata) => {
                if (err) logger.error(err);

                await qtnQueryMod(`SELECT * FROM magodqtn.qtn_termsandconditions where QtnId = '${qtnDetails[0]["QtnID"]}'`, async (err, qtnTC) => {
                    await qtnQueryMod(`SELECT * FROM magodmis.cust_data where Cust_Code = '${qtnDetails[0]["Cust_Code"]}'`, async (err, customer) => {
                        console.log(customer);
                        await qtnQueryMod(`SELECT * FROM magodqtn.qtn_itemslist where QtnId = '${qtnDetails[0]["QtnID"]}'`, async (err, qtnitems) => {
                            if (err) logger.error(err);
                            console.log("Qtn Items : ")
                            console.log(qtnitems)
                            qtnQueryMod(`SELECT * FROM magodqtn.qtntaxes where QtnId = '${qtnDetails[0]["QtnID"]}'`, async (err, qtnTaxes) => {
                                sendQuotation(qtnDetails, unitdata, qtnTC, customer, qtnitems, qtnTaxes, (err, info) => {
                                    if (err) logger.error(err);
                                    console.log(info);
                                    res.send(info);
                                });
                            });
                        });
                    });
                });
            });

            // quotationDetails(qtnDetails);
            //    res.send(qtnDetails, unitdata, qtnTC, customer);
        });

    } catch (error) {
        next(error)
    }

});

//// 
// Send Estimation mail

quoteRouter.post(`/sendestimationmail`, async (req, res, next) => {
    console.log('sendestimationmail  ' + req.body.qtnno)
    try {
        const qtnno = req.body.qtnno.replaceAll("_", "/");
        qtnQueryMod(`SELECT * FROM magodqtn.qtnlist where QtnNo = '${qtnno}'`, async (err, qtnDetails) => {
            if (err) logger.error(err);
            console.log(qtnDetails);
            qtnQueryMod(`SELECT * FROM magod_setup.magodlaser_units where current = '1'`, async (err, unitdata) => {
                if (err) logger.error(err);
                qtnQueryMod(`SELECT * FROM magodmis.cust_data where Cust_Code = '${qtnDetails[0]["Cust_Code"]}'`, async (err, customer) => {
                    console.log(customer);
                    qtnQueryMod(`SELECT * FROM magodqtn.qtn_profiledetails where QtnId = '${qtnDetails[0]["QtnID"]}'`, async (err, qtnprofile) => {
                        sendEstimation(qtnDetails, unitdata, qtnprofile, customer, (err, info) => {
                            if (err) logger.error(err);
                            console.log(info);
                            res.send(info);
                        });
                    });
                });
            });
        });
    } catch (error) {
        next(error)
    }

});

// Import rates save to db
quoteRouter.post(`/updateimportedratesprofiledetails`, async (req, res, next) => {
    console.log('updateimportedratesprofiledetails');
    try {
        const qtnno = req.body.quotationno;
        const qtnprofdets = req.body.qtnprofileDetails;
        qtnQueryMod(`SELECT QtnID, QtnType  FROM magodqtn.qtnlist where QtnNo='${qtnno}'`, async (err, data) => {
            if (err) logger.error(err);
            console.log(data);
            if (data.length > 0) {
                const qtnid = data[0].QtnID;
                qtnQueryMod(`DELETE FROM magodqtn.qtn_itemslist WHERE qtnId=${qtnid}`, async (err, data) => {
                    if (err) logger.error(err);
                    console.log(data);
                });
                console.log(qtnprofdets);
                for (let i = 0; i < qtnprofdets.length; i++) {
                    qtnQueryMod(`UPDATE magodqtn.qtn_profiledetails SET Unit_JobWork_Cost = '${qtnprofdets[i]["Unit_JobWork_Cost"]}',Unit_Material_Cost='${qtnprofdets[i]["Unit_Material_Cost"]}'
                          WHERE QtnID = ${qtnid} And ProfileId = '${qtnprofdets[i][ProfileId]}'`, async (err, data) => {
                        if (err) logger.error(err);
                    });
                }
                //res.send({ message: "Updated Successfully" })
                qtnQueryMod(`SELECT * FROM magodqtn.qtn_profiledetails where QtnId = '${qtnid}'`, async (err, data) => {
                    if (err) logger.error(err);
                    console.log(data);
                    res.send(data);
                });
            }

        });
    }
    catch (error) {
        next(error)
    }
});

// Get Profile Details by Qtn No
quoteRouter.post(`/getprofiledetbyqtnno`, async (req, res, next) => {
    console.log("==================== getprofiledetbyqtnno =====================")
    try {

        let { qtnNo } = req.body;
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnNo}'`);
        if (findQtnID.length === 0 || !findQtnID[0].QtnID) throw new Error("Quotation No not found");
        await qtnQueryMod(`SELECT * FROM magodqtn.qtn_profiledetails where QtnId = '${findQtnID[0].QtnID}'`, async (err, qtnprofile) => {
            if (err) logger.error(err);
            res.send(qtnprofile);
        });
    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/deletefromalltables`, async (req, res, next) => {
    console.log("Deleting Files");
    try {
        let qtnno = req.body.quotationNo;
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);
        await qtnQueryMod(`DELETE FROM magodqtn.qtn_profiledetails WHERE QtnId = '${findQtnID[0].QtnID}'`, async (err, data) => {
            if (err) logger.error(err);
            //     console.log(data);
            await qtnQueryMod(`Delete from magodqtn.taskdetails where QtnId = '${findQtnID[0].QtnID}'`, async (err, data) => {
                if (err) logger.error(err);
                await qtnQueryMod(`Delete from magodqtn.qtnlist where QtnID = '${findQtnID[0].QtnID}'`, async (err, data) => {
                    if (err) logger.error(err);
                    res.send("");
                });
            });
            // await qtnQueryMod(`Delete from magodqtn.qtnlist where QtnID = '${findQtnID[0].QtnID}'`, async (err, data) => {
            //     if (err) logger.error(err);
            //     console.log(data);
            //     res.send("");
        });
        //   res.send("");
    }
    catch (error) {
        next(error);
    }
});

// Get Profile Details by Qtn Id
quoteRouter.post(`/getprofiledetbyqtnid`, async (req, res, next) => {
    console.log("==================== getprofiledetbyqtnid =====================")
    try {
        let qtnId = req.body.qtnid;
        await qtnQueryMod(`SELECT * FROM magodqtn.qtn_profiledetails where QtnId = '${qtnId}'`, async (err, data) => {
            if (err) logger.error(err);
            // console.log("Profile Details : ")
            // console.log(data);
            //  if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                let strpath = data[i].Path;
                strpath = strpath.replaceAll("/", "_");
                const filePath = strpath + "\\" + data[i].Dwg_Name;
                let filedata = fs.readFileSync(filePath, 'utf8');
                data[i].filedata = filedata;

                data[i].operation = data[i].Operation;
                data[i].material = data[i].Material;
                data[i].partnetarea = data[i].PartNetArea;
                data[i].mtrlcode = data[i].mtrl_code;
                data[i].grade = data[i].MtrlGrade;
                data[i].lengthOfCut = data[i].LOC;
                data[i].tolerance = data[i].Tolerance;
                data[i].inspectionlevel = data[i].InspLevel;
                data[i].noOfPierces = data[i].NoofPierces;
                data[i].outopen = data[i].OutOpen;
                data[i].partnetwt = data[i].PartNetWt;
                data[i].partoutarea = data[i].PartOutArea;
                data[i].partoutwt = data[i].PartOutWt;
                data[i].complexity = data[i].Complexity;
                data[i].rectweight = data[i].RectWeight;
                data[i].partrectarea = data[i].PartRectArea;
                data[i].jwcost = data[i].Unit_JobWork_Cost;
                data[i].unitmaterialcost = data[i].Unit_Material_Cost;
                data[i].thickness = data[i].Thickness;
                data[i].quantity = data[i].Qty;


            }
            res.send(data);
        });
    } catch (error) {
        next(error)
    }
});

// Get Profile Details
quoteRouter.post(`/getqtnprofiledetails`, async (req, res, next) => {
    console.log('getqtnprofiledetails  ' + req.body.QtnNo)
    try {
        const qtnno = req.body.QtnNo;
        //console.log("Quote No. " + req.body.QtnNo);
        if (!qtnno) res.send(createError.BadRequest());
        //  let Qno = qtnno.replaceAll('/', '-');
        qtnQueryMod(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${req.body.QtnNo}'`, async (err, qtnlstdata) => {
            //          console.log(qtnlstdata);
            if (err) logger.error(err);
            //console.log("Qtn ID : " + qtnlstdata[0].QtnID)
            qtnQueryMod(`SELECT * FROM magodqtn.qtn_profiledetails where QtnId = '${qtnlstdata[0].QtnID}'`, async (err, data) => {
                if (err) logger.error(err);
                //        console.log("Profile Details : ")
                //      console.log(data);
                for (let i = 0; i < data.length; i++) {
                    let strpath = data[i].Path;
                    console.log(data[i]);
                    strpath = strpath.replaceAll("/", "_");
                    if (data[i].Dwg_Name === "No Drawing" || data[i].Dwg_Name === "" || data[i].Dwg_Name === null || data[i].Dwg_Name === undefined) {
                        data[i].filedata = "";
                    } else {
                        const filePath = strpath + "\\" + data[i].Dwg_Name;
                        let filedata = fs.readFileSync(filePath, 'utf8');
                        data[i].filedata = filedata;
                    }
                    data[i].operation = data[i].Operation;
                    data[i].material = data[i].Material;
                    data[i].partnetarea = data[i].PartNetArea;
                    data[i].mtrlcode = data[i].mtrl_code;
                    data[i].grade = data[i].MtrlGrade;
                    data[i].lengthOfCut = data[i].LOC;
                    data[i].tolerance = data[i].Tolerance;
                    data[i].inspectionlevel = data[i].InspLevel;
                    data[i].noOfPierces = data[i].NoofPierces;
                    data[i].outopen = data[i].OutOpen;
                    data[i].partnetwt = data[i].PartNetWt;
                    data[i].partoutarea = data[i].PartOutArea;
                    data[i].partoutwt = data[i].PartOutWt;
                    data[i].complexity = data[i].Complexity;
                    data[i].rectweight = data[i].RectWeight;
                    data[i].partrectarea = data[i].PartRectArea;
                    data[i].jwcost = data[i].Unit_JobWork_Cost;
                    data[i].unitmaterialcost = data[i].Unit_Material_Cost;
                    data[i].thickness = data[i].Thickness;
                    data[i].quantity = data[i].Qty;
                }
                //   console.log(data[0].Operation)
                res.send(data);
                // res.send(data);
            });
        });
    }
    catch (error) {
        next(error)
    }
});



quoteRouter.post(`/getqtntaxdetailsbyqtnid`, async (req, res, next) => {
    console.log("Tax Details Called from Find Quote");
    try {
        //   const quoteno = req.body.quotationNo;
        console.log("req tax. " + req.body.qtnid);
        // const qtnno = req.body.qtnno;
        //console.log("Yes Tax  Qtn No : " + req.body.qtnno);

        // let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);
        //console.log("getqtntaxdetailsbyqtnno - Qtn ID : " + findQtnID[0].QtnID)        
        await qtnQueryMod(`SELECT * FROM magodqtn.qtntaxes where QtnID = '${req.body.qtnid}'`, async (err, data) => {
            if (err) logger.error(err); // throw createError.InternalServerError(err);
            //        console.log("Tax Data : ");
            //      console.log(data);
            res.send(data)
        });
    } catch (error) {
        next(error)
    }
});






// get Profile Sum of Qty
quoteRouter.post(`/getqtnprofilesumqty`, async (req, res, next) => {
    console.log('getqtnprofilesumqty  ' + req.body.quotationno)
    try {
        const qtnno = req.body.quotationno;
        qtnQueryMod(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${req.body.quotationno}'`, async (err, qtnid) => {
            //       console.log(qtnid);
            if (err) logger.error(err);
            qtnQueryMod(`SELECT SUM(Qty) as SumOfQty FROM magodqtn.qtn_profiledetails where QtnId = '${qtnid[0].QtnID}' group by QtnTaskId`, async (err, data) => {
                if (err) logger.error(err);
                console.log(data);
                res.send(data);
            }
            );
        });
    }
    catch (error) {
        next(error)
    }
});

// get Qtn Task List details

quoteRouter.post(`/gettasklistdatabyqtnno`, async (req, res, next) => {
    console.log('************************ gettasklistdatabyqtnno *************** ' + req.body.QtnNo)
    try {
        const qtnno = req.body.QtnNo;
        console.log("req. " + req.body.QtnNo);

        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);
        // qtnQueryMod(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${req.body.QtnNo}'`, async (err, qtnid) => {
        //    if (err) logger.error(err);
        qtnQueryMod(`SELECT * FROM magodqtn.qtntasklist where QtnId = '${findQtnID[0].QtnID}'`, async (err, data) => {
            if (err) logger.error(err);

            // let groups = data.reduce((r, qtnProfileObject) => {
            //     const key = `${qtnProfileObject.mtrl_code}-${qtnProfileObject.MtrlGrade}-${qtnProfileObject.Thickness}-${qtnProfileObject.Operation}-${qtnProfileObject.Tolerance}-${qtnProfileObject.InspLevel}`;
            //     r[key] = [...r[key] || [], qtnProfileObject];
            //     return r;
            // }, {});
            console.log("Data from qtn task list");
            console.log(data);
            res.send(data);
        });
        // });
    }
    catch (error) {
        next(error)
    }

});

// Get Profile Details
quoteRouter.post(`/gettasklistdata`, async (req, res, next) => {
    // console.log('gettasklistdata  ABD - ' + req.body.QtnNo.replaceAll("_", "/"))
    try {
        const qtnno = req.body.QtnNo; //.replaceAll("_", "/")
        //  console.log("req. " + req.body.QtnNo);
        //   let Qno = qtnno.replaceAll('/', '-');
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);
        //  qtnQueryMod(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`, async (err, qtnid) => {
        //    if (err) logger.error(err);
        // console.log(findQtnID);
        await qtnQueryMod(`SELECT * FROM magodqtn.qtntasklist where QtnId = '${findQtnID[0].QtnID}'`, async (err, data) => {
            if (err) logger.error(err);
            //    console.log(data);
            let groups = data.reduce((r, qtnProfileObject) => {
                const key = `${qtnProfileObject.mtrl_code}-${qtnProfileObject.MtrlGrade}-${qtnProfileObject.Thickness}-${qtnProfileObject.Operation}-${qtnProfileObject.Tolerance}-${qtnProfileObject.InspLevel}`;
                r[key] = [...r[key] || [], qtnProfileObject];
                return r;
            }, {});

            res.send(groups);

        });
    }
    catch (error) {
        next(error)
    }

});

//Update Qtn Task List Details
quoteRouter.post(`/updateqtntasklistdets`, async (req, res, next) => {
    console.log('**************  updateqtntasklistdets  setTaskRates   ******* =  ' + req.body.quotationno)
    //    console.log("req data : " + JSON.stringify(req.body.taskgrpData));
    //    console.log("material handling charge : " + req.body.taskmtrlhndcharge);
    try {

        const qtnno = req.body.quotationno;
        //  const taskno = req.body.taskno;
        const taskgrpData = req.body.taskgrpData;
        //   console.log("from - updateqtntasklistdets - taskgrpData : " + JSON.stringify(taskgrpData));
        //        console.log("Task No : " + taskgrpData[0].TaskNo);
        const tsetuprate = req.body.tasksetuprate > 0 ? req.body.tasksetuprate : 0;
        const tmtrlrate = req.body.Task_MaterialRate > 0 ? req.body.Task_MaterialRate : 0;
        //       console.log("Task est data : " + JSON.stringify(req.body.taskgrpData));

        qtnQueryMod(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`, async (err, qtndata) => {

            if (err) logger.error(err);
      
            for (let i = 0; i < taskgrpData.length; i++) {
                // qtnQueryMod(`UPDATE magodqtn.qtntasklist Set Task_Basic_Cutting_Cost = ${taskgrpData[i].Task_Basic_Cutting_Cost},
                //  Task_Pgme_charge = ${taskgrpData[i].Task_Pgme_charge}, Task_Setup_loading_charge = ${taskgrpData[i].Task_Setup_loading_charge},
                //  Task_cuttingRate=${taskgrpData[i].Task_cuttingRate},  Task_Net_wt=${taskgrpData[i].Task_Net_wt},  
                //  Task_SettingUpRate = ${taskgrpData[i].Task_SettingUpRate}, Task_PierceRate = ${taskgrpData[i].Task_PierceRate},Task_Mtrl_rate = ${taskgrpData[i].Task_Mtrl_rate},
                //  Task_SheetHandlingRate= ${taskgrpData[i].Task_SheetHandlingRate}, Task_mtrlHandlingRate= ${taskgrpData[i].Task_mtrlHandlingRate}, 
                //  Task_Qtn_Mtrl_Rate=${taskgrpData[i].Task_Qtn_Mtrl_Rate}, Task_Mtrl_Weight=${taskgrpData[i].Task_Mtrl_Weight}, TaskParts=${taskgrpData[i].CountOfDwg_Name},
                //  Task_Mtrl_Handling_Charge = ${taskgrpData[i].Task_Mtrl_Handling_Charge}, TaskJobWorkCost=${taskgrpData[i].TaskJobWorkCost},
                //  CountOfDwg_Name=${taskgrpData[i].CountOfDwg_Name}, TaskLOC = ${(taskgrpData[i].TaskLOC)}, 
                //  TaskRectWeight= ${taskgrpData[i].TaskRectWeight}, TaskHoles = ${(taskgrpData[i].TaskHoles)}, 
                //  TaskMtrlArea = ${taskgrpData[i].TaskMtrlArea}, Task_Mtrl_rate =${tmtrlrate}, TaskNetArea= ${taskgrpData[i].TaskNetArea}, 
                //  SumOfQty = ${(taskgrpData[i].SumOfQty)}, TaskDwgs = ${taskgrpData[i].CountOfDwg_Name}, 
                //  Task_Qtn_JW_Rate = ${taskgrpData[i].Task_Qtn_JW_Rate}, Task_Mtrl_Cost = ${taskgrpData[i].Task_Mtrl_Cost},Task_Qtn_Mtrl_Rate = ${taskgrpData[i].Task_Qtn_Mtrl_Rate},
                //  TaskTotalCost = ${Number(taskgrpData[i].TaskJobWorkCost) + Number(taskgrpData[i].Task_Mtrl_Cost)}, Task_Mtrl_rate = ${Number(taskgrpData[i].Task_Mtrl_rate)}
                //  where QtnId = '${qtndata[0].QtnID}' and TaskNo = '${taskgrpData[i].TaskNo}'`, async (err, data) => {
                qtnQueryMod(`UPDATE magodqtn.qtntasklist Set Task_Basic_Cutting_Cost = ${taskgrpData[i].Task_Basic_Cutting_Cost},
                    Task_Pgme_charge = ${taskgrpData[i].Task_Pgme_charge}, Task_Setup_loading_charge = ${taskgrpData[i].Task_Setup_loading_charge},
                    Task_cuttingRate=${taskgrpData[i].Task_cuttingRate},    
                    Task_SettingUpRate = ${taskgrpData[i].Task_SettingUpRate}, Task_PierceRate = ${taskgrpData[i].Task_PierceRate},Task_Mtrl_rate = ${taskgrpData[i].Task_Mtrl_rate},
                    Task_SheetHandlingRate= ${taskgrpData[i].Task_SheetHandlingRate}, Task_mtrlHandlingRate= ${taskgrpData[i].Task_mtrlHandlingRate}, 
                    Task_Qtn_Mtrl_Rate=${taskgrpData[i].Task_Qtn_Mtrl_Rate}, Task_Mtrl_Weight=${taskgrpData[i].Task_Mtrl_Weight}, TaskParts=${taskgrpData[i].CountOfDwg_Name},
                    Task_Mtrl_Handling_Charge = ${taskgrpData[i].Task_Mtrl_Handling_Charge}, TaskJobWorkCost=${taskgrpData[i].TaskJobWorkCost},
                    CountOfDwg_Name=${taskgrpData[i].CountOfDwg_Name}, TaskLOC = ${(taskgrpData[i].TaskLOC)}, 
                    TaskHoles = ${(taskgrpData[i].TaskHoles)}, 
                    TaskMtrlArea = ${taskgrpData[i].TaskMtrlArea}, Task_Mtrl_rate =${tmtrlrate}, TaskNetArea= ${taskgrpData[i].TaskNetArea}, 
                    SumOfQty = ${(taskgrpData[i].SumOfQty)}, TaskDwgs = ${taskgrpData[i].CountOfDwg_Name}, 
                    Task_Qtn_JW_Rate = ${taskgrpData[i].Task_Qtn_JW_Rate}, Task_Mtrl_Cost = ${taskgrpData[i].Task_Mtrl_Cost},Task_Qtn_Mtrl_Rate = ${taskgrpData[i].Task_Qtn_Mtrl_Rate},
                    TaskTotalCost = ${Number(taskgrpData[i].TaskJobWorkCost) + Number(taskgrpData[i].Task_Mtrl_Cost)}, Task_Mtrl_rate = ${Number(taskgrpData[i].Task_Mtrl_rate)}
                    where QtnId = '${qtndata[0].QtnID}' and TaskNo = '${taskgrpData[i].TaskNo}'`, async (err, data) => {
                    if (err) logger.error(err);

                });
            }

            //               console.log("Task List Data3 - TaskNo : " + taskData.TaskNo);
            //               console.log(" Line - 665 - Task Net Weight : " + taskData.Task_Net_wt);
            //taskgrpData.forEach((taskData) => {
            // qtnQueryMod(`UPDATE magodqtn.qtntasklist Set Task_Basic_Cutting_Cost = ${taskData.Task_Basic_Cutting_Cost},
            //  Task_Pgme_charge = ${taskData.Task_Pgme_charge}, Task_Setup_loading_charge = ${taskData.Task_Setup_loading_charge},
            //  Task_cuttingRate=${taskData.Task_cuttingRate},  Task_Net_wt=${taskData.Task_Net_wt},  
            //  Task_SettingUpRate = ${taskData.Task_SettingUpRate}, Task_PierceRate = ${taskData.Task_PierceRate},
            //  Task_SheetHandlingRate= ${taskData.Task_SheetHandlingRate}, Task_mtrlHandlingRate= ${taskData.Task_mtrlHandlingRate}, 
            //  Task_Qtn_Mtrl_Rate=${taskData.Task_Qtn_Mtrl_Rate}, Task_Mtrl_Weight=${taskData.Task_Mtrl_Weight}, TaskParts=${taskData.CountOfDwg_Name},
            //  Task_Mtrl_Handling_Charge = ${taskData.Task_Mtrl_Handling_Charge}, TaskJobWorkCost=${taskData.TaskJobWorkCost},
            //  CountOfDwg_Name=${taskData.CountOfDwg_Name}, TaskLOC = ${(taskData.TaskLOC)}, 
            //  TaskRectWeight= ${taskData.TaskRectWeight}, TaskHoles = ${(taskData.TaskHoles)}, 
            //  TaskMtrlArea = ${taskData.TaskMtrlArea}, Task_Mtrl_rate =${tmtrlrate}, TaskNetArea= ${taskData.TaskNetArea}, 
            //  SumOfQty = ${(taskData.SumOfQty)}, TaskDwgs = ${taskData.CountOfDwg_Name}, 
            //  Task_Qtn_JW_Rate = ${taskData.Task_Qtn_JW_Rate}, Task_Mtrl_Cost = ${taskData.Task_Mtrl_Cost},Task_Qtn_Mtrl_Rate = ${taskData.Task_Qtn_Mtrl_Rate},
            //  TaskTotalCost = ${Number(taskData.TaskJobWorkCost) + Number(taskData.Task_Mtrl_Cost)}, Task_Mtrl_rate = ${Number(taskData.Task_Mtrl_rate)}
            //  where QtnId = '${qtndata[0].QtnID}' and TaskNo = '${taskData.TaskNo}'`, async (err, data) => {
            //     if (err) logger.error(err);
            //     //      console.log(data);
            //     //  taskupdated = true;

            // });

            // qtnQueryMod(`UPDATE magodqtn.qtntasklist SET ? WHERE QtnTaskID = ?`, [updateValues, QtnTaskID], (err, results, fields) => {
            //     if (err) {
            //         console.error(err);
            //     } else {
            //         console.log('Updated successfully:', results);
            //     }
            // });

            //            })

            res.send({ message: "Updated Successfully" });


        });
    }
    catch (error) {
        next(error)
    }

});

quoteRouter.post(`/updateprofilejwcost`, async (req, res, next) => {
    console.log('updateprofilejwcost  ' + req.body.quotationNo)
    try {
        console.log("line - 720 - quotation.js - updateprofilejwcost");
        // console.log(taskdetailsdata);
        const qtnno = req.body.quotationNo;
        const qtnprofdets = req.body.taskdetailsdata;
        console.log(qtnprofdets);
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);

        for (let i = 0; i < qtnprofdets.length; i++) {
            await qtnQueryMod(`UPDATE magodqtn.qtn_profiledetails SET Unit_JobWork_Cost = '${qtnprofdets[i]["Unit_JobWork_Cost"]}'
                          WHERE QtnID = ${findQtnID[0].QtnID} And Dwg_Name = '${qtnprofdets[i].Dwg_Name}'`, async (err, data) => {
                if (err) logger.error(err);

                await qtnQueryMod(`UPDATE magodqtn.taskdetails SET Unit_JobWork_Cost = '${qtnprofdets[i]["Unit_JobWork_Cost"]}'
                WHERE QtnID = ${findQtnID[0].QtnID} And Dwg_Name = '${qtnprofdets[i].Dwg_Name}'`, async (err, data) => {
                    if (err) logger.error(err);
                });
            });
        }
        //res.send({ message: "Updated Successfully" })
        qtnQueryMod(`SELECT * FROM magodqtn.qtn_profiledetails where QtnId = '${findQtnID[0].QtnID}'`, async (err, data) => {
            if (err) logger.error(err);
            console.log(data);
            res.send(data);
        });
    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/updateprofilemtrlcost`, async (req, res, next) => {
    console.log('updateprofilejwcost  ' + req.body.quotationNo)
    try {
        console.log("line - 720 - quotation.js - updateprofilemtrlcost");
        // console.log(taskdetailsdata);
        const qtnno = req.body.quotationNo;
        const qtnprofdets = req.body.taskgrpData;
        console.log(qtnprofdets);
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);

        for (let i = 0; i < qtnprofdets.length; i++) {
            await qtnQueryMod(`UPDATE magodqtn.qtn_profiledetails SET Unit_Material_cost='${qtnprofdets[i]["Unit_Material_cost"]}'
                          WHERE QtnID = ${findQtnID[0].QtnID} And Dwg_Name = '${qtnprofdets[i].Dwg_Name}'`, async (err, data) => {
                if (err) logger.error(err);

                await qtnQueryMod(`UPDATE magodqtn.taskdetails SET Unit_Material_cost='${qtnprofdets[i]["Unit_Material_cost"]}'
                WHERE QtnID = ${findQtnID[0].QtnID} And Dwg_Name = '${qtnprofdets[i].Dwg_Name}'`, async (err, data) => {
                    if (err) logger.error(err);

                });
            });
        }
        //res.send({ message: "Updated Successfully" })
        //qtnQueryMod(`SELECT * FROM magodqtn.qtn_profiledetails where QtnId = '${findQtnID[0].QtnID}'`, async (err, data) => {
        qtnQueryMod(`SELECT * FROM magodqtn.taskdetails where QtnId = '${findQtnID[0].QtnID}'`, async (err, data) => {
            if (err) logger.error(err);
            console.log(data);
            res.send(data);
        });
    } catch (error) {
        next(error)
    }
});


quoteRouter.post(`/updateprofilejobcharges`, async (req, res, next) => {
    console.log("Update Profile Job Charges");
    try {
        let PartToTaskRatio, partWtRation = 0;
        const qtnno = req.body.quotationno;
        qtnQueryMod(`SELECT ql.QtnID from magodqtn.qtnlist ql where ql.QtnNo = '${qtnno}'`, async (err, qtndata) => {
            //        console.log(qtndata);
            if (err) logger.error(err);
            qtnQueryMod(`SELECT * FROM magodqtn.qtntasklist where QtnId = '${qtndata[0].QtnID}'`, async (err, qtntaskdata) => {
                console.log(qtntaskdata);
                if (err) logger.error(err);
                qtnQueryMod(`Select * from magodqtn.taskdetails where QtnTaskId = '${qtntaskdata[0].QtnTaskID}'`, async (err, taskdata) => {
                    //   console.log(taskdata);
                    if (err) logger.error(err);

                    for (let i = 0; i < qtntaskdata.length; i++) {
                        console.log(qtntaskdata.length);
                        for (let j = 0; j < taskdata.length; j++) {
                            if (qtntaskdata[i].QtnTaskID == taskdata[j].QtnTaskId) {

                            }
                            console.log("638 - Part Wt. Ratio : " + partWtRation);
                            console.log("639- Material Handling Charge : " + taskdata[0].Material_Handling_Charge);
                            for (let k = 0; k < taskdata.length; k++) {
                                console.log(taskdata[k].Dwg_Name + " - " + taskdata[k].Cutting_Charge + " - " + taskdata[k].Pgm_Charge + " - " + taskdata[k].SetUp_Loading_Charge + " - " + taskdata[k].Material_Handling_Charge + " - " + taskdata[k].Unit_Material_Cost)
                                qtnQueryMod(`UPDATE magodqtn.qtn_profiledetails set Cutting_Charge = ${taskdata[k].Cutting_Charge},
                                Pgm_Charge_Task = ${parseFloat(taskdata[k].Pgm_Charge).toFixed(2)}, SetUp_Loading_Charge_Task = ${parseFloat(taskdata[k].SetUp_Loading_Charge).toFixed(2)}, 
                                Material_Handling_Cost_Task = ${parseFloat(taskdata[k].Material_Handling_Charge).toFixed(2)},
                                Unit_JobWork_Cost = ${parseFloat(taskdata[k].Pgm_Charge) + parseFloat(taskdata[k].SetUp_Loading_Charge) + parseFloat(taskdata[k].Material_Handling_Charge) + parseFloat(taskdata[k].Cutting_Charge)},
                                Unit_Material_cost = ${parseFloat(taskdata[k].Unit_Material_Cost ?? 0).toFixed(2)} 
                                where QtnId = '${qtndata[0].QtnID}' and QtnSrl = ${k + 1}`, async (err, data) => {
                                    if (err) logger.error(err);

                                });
                            }
                            //console.log(taskdata);
                            qtnQueryMod(`SELECT * FROM magodqtn.qtn_profiledetails where QtnId = ${qtndata[0].QtnID}`, async (err, qtnprofiledata) => {
                                if (err) logger.error(err);
                                for (let l = 0; l < qtnprofiledata.length; l++) {
                                    let untjbcost = 0;
                                    untjbcost = parseFloat(parseFloat(qtnprofiledata[l].Cutting_Charge) + parseFloat(qtnprofiledata[l].Pgm_Charge_Task) + parseFloat(qtnprofiledata[l].SetUp_Loading_Charge_Task) + parseFloat(qtnprofiledata[l].Material_Handling_Charge_Task > 0 ? qtnprofiledata[l].Material_Handling_Charge_Task : 0));

                                    qtnQueryMod(`UPDATE magodqtn.taskdetails set Cutting_Charge = ${qtnprofiledata[l].Cutting_Charge},
                            Pgm_Charge=${parseFloat(qtnprofiledata[l].Pgm_Charge_Task).toFixed(2)}, SetUp_Loading_Charge=${parseFloat(qtnprofiledata[l].SetUp_Loading_Charge_Task).toFixed(2)},
                            Material_Handling_Charge=${parseFloat(qtnprofiledata[l].Material_Handling_Charge_Task > 0 ? qtnprofiledata[l].Material_Handling_Charge_Task : 0).toFixed(2)},
                            Unit_Material_cost = ${parseFloat(qtnprofiledata[l].Unit_Material_Cost > 0 ? qtnprofiledata[l].Unit_Material_Cost : 0).toFixed(2)},
                            Unit_JobWork_Cost = ${parseFloat(untjbcost).toFixed(2)}
                            where QtnTaskId = '${qtnprofiledata[l].QtnTaskId}' and Dwg_Name = '${qtnprofiledata[l].Dwg_Name}'`, async (err, data) => { });
                                }
                            });
                        }

                    }

                });
            });
        });

        res.status(200).send({});

    }
    catch (error) {
        next(error)
    }
});

quoteRouter.post(`/updateQtnTaskListMatDets`, async (req, res, next) => {
    try {
        const qtnno = req.body.quotationNo;
        const mtrl = req.body.mtrlcode;
        const mtrlarea = req.body.taskMtrlArea;
        const mtrlwt = req.body.taskMtrlWeight;

        console.log("updateQtnTaskListMatDets - " + qtnno + " - " + mtrl + " - " + mtrlarea + " - " + mtrlwt);

        qtnQueryMod(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`, async (err, qtnid) => {
            if (err) logger.error(err);
            //, Task_Mtrl_Weight = ${mtrlwt} 
            qtnQueryMod(`UPDATE magodqtn.qtntasklist set TaskMtrlArea = ${mtrlarea}
            where QtnId = '${qtnid[0].QtnID}' And mtrl_code= '${mtrl}'`, async (err, data) => {
                if (err) logger.error(err);
                res.send(data);
            });
        });

    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/gettaskprogrammingrates`, async (req, res, next) => {
    try {
        console.log('Programming Rate List ');
        qtnQueryMod(`SELECT * FROM magodqtn.programmingratelist where current = '-1'`, (err, prgrtdata) => {
            if (err) logger.error(err);
            //      console.log(prgrtdata);
            res.send(prgrtdata)
        })
    }
    catch (error) {
        next(error)
    }
});

quoteRouter.post(`/getmtrlhandlingrates`, async (req, res, next) => {
    try {
        const mtrl = req.body.material;
        //    console.log("getmtrlhandlingrates - " + mtrl)
        //   const opertn = req.body.process;

        //   if (!mtrl) res.send(createError.BadRequest())

        qtnQueryMod(`SELECT * FROM magodqtn.mtrl_handling_rates where Material = '${mtrl}'`, (err, mtrlrtdata) => {
            if (err) logger.error(err);
            res.send(mtrlrtdata)
        })
    }
    catch (error) {
        next(error)
    }
});

quoteRouter.post(`/savefabassy`, async (req, res, next) => {
    //    console.log('savefabassy  ');
    try {
        qtnQueryMod(`Select LAST_INSERT_AssyId() as AssyId`, async (err, assyid) => {
            if (err) logger.error(err);
            qtnQueryMod(`INSERT INTO magodqtn.fab_subassy(AssyID, AssyName, UnitLabourCost, Quantity)
                    Values (${assyid[0].AssyId},'${req.body.assyname}','${req.body.unitlabourcost}','${req.body.quantity}')`, async (err, data) => {
            });
            res.send({ message: "Saved Successfully" });
        });
    } catch (error) {
        next(error)
    }
});


quoteRouter.post(`/savefabassyparts`, async (req, res, next) => {

    //    console.log("**** +++++++ =======  Save Fab Assy Parts ========= +++++++ ****")
    //    console.log(req.body.tree);
    try {
        const { quotationNo, tree } = req.body;
        qtnQueryMod(`Select QtnID from magodqtn.qtnlist where QtnNo = '${quotationNo.replaceAll("_", "/")}'`, async (err, qtnid) => {
            if (err) throw err;
            if (qtnid != null) {
                let Qtnid = qtnid[0].QtnID;
                console.log("Initial -1 Tree save");
                let assemblyid = 0;
                let subassemblyid = 0;
                //assemblyid = insertTreeValues(Qtnid, tree);
                assemblyid = insertTreesVal(Qtnid, tree);
                subassemblyid = insertSubAssy(Qtnid);
                //    subassmoperations = insertSubAssyOperations(Qtnid);
                res.send({ message: "Saved Successfully", assemblyid: assemblyid, subassemblyid: subassemblyid });
            }
        });
    } catch (error) {
        next(error)
    }

});

function insertTreesVal(Qtnid, tree) {
    try {
        let assemid = 0;
        qtnQueryMod(`Select * from magodqtn.fabrication_assyparts where Qtnid = '${Qtnid}'`, async (err, fabassydata) => {
            if (err) throw err;
            if (fabassydata.length > 0) {
                for (let j = 0; j < fabassydata.length; j++) {
                    qtnQueryMod(`Update magodqtn.fabrication_assyparts set Level = ${tree.level}, Name = '${tree.name}' ,IsAssy = ${tree.isassy}
                where QtnId = '${Qtnid}' and BaseId = ${fabassydata[j].BaseId} and ParentId = ${fabassydata[j].ParentId}`, async (err, updt) => {
                        if (err) throw err;
                        for (let i = 0; i < tree.children.length; i++) {
                            insertTreeChildValues(Qtnid, fabassydata[j].BaseId, fabassydata[j].ParentId, tree.children[i]);
                        }
                    })
                }
            } else {
                qtnQueryMod(`Insert into magodqtn.fabrication_assyparts(QtnId, BaseId,ParentId,Level,Name,IsAssy,Source,MaterialCost,LabourCost) 
                values (${Qtnid},0,0,${tree.level},'${tree.name}',1,'InHouse','0.00','0.00')`, (err, ins) => {
                    if (err) throw err;
                    let baseid = ins.insertId;
                    qtnQueryMod(`Update magodqtn.fabrication_assyparts set BaseId = ${baseid}, ParentId = ${baseid} 
                                        where Id = ${baseid}`, (err, updt) => {
                        if (err) throw err;
                        if (tree.children != null) {
                            for (let i = 0; i < tree.children.length; i++) {
                                insertTreeChildValues(Qtnid, baseid, baseid, tree.children[i]); //  det[0].BaseId, basedet[0].Id, tree.children[i]);
                            }
                        }
                    });
                });
            }

        });
    } catch (error) {
        next(error)
    }
}



function insertTreeChildValues(Qtnid, baseid, parentid, tree) {
    let bid = baseid;

    console.log(tree)
    qtnQueryMod(`Select * From magodqtn.fabrication_assyparts where QtnId = ${Qtnid} And Name = '${tree.name}' and Level > 0`, async (err, data) => {
        if (err) throw err;
        if (data.length <= 0) {

            qtnQueryMod(`Insert into magodqtn.fabrication_assyparts(QtnId, BaseId,ParentId,Level,Name,IsAssy,Source,MaterialCost,LabourCost) 
        values (${Qtnid},${baseid},${parentid},${tree.level},'${tree.name}',${tree.isassy},'InHouse','0.00','0.00')`, (err, ins) => {
                if (err) throw err;
                let id = ins.insertId;
                if ((tree.isassy == 0) && (tree.children.length == 0)) {

                    qtnQueryMod(`Select * from magodqtn.fab_bom where AssyID = ${baseid} and PartName = '${tree.name}'`, async (err, bomdata) => {
                        if (err) throw err;
                        if (bomdata.length <= 0) {
                            qtnQueryMod(`Insert into magodqtn.fab_bom (AssyID, PartName, UnitMaterialCost,Quantity) 
                        values (${baseid},'${tree.name}','0.00',1)`, (err, ins) => {
                                if (err) throw err;
                            });
                        } else {
                            res.send({ message: 'Already Exists in BOM' });
                        }
                    });
                }
                for (let i = 0; i < tree.children.length; i++) {
                    insertTreeChildValues(Qtnid, bid, id, tree.children[i]);
                }
            });
        } else {
            qtnQueryMod(`Update magodqtn.fabrication_assyparts set BaseId = ${baseid}, ParentId = ${parentid}, Level = ${tree.level}, 
            Name = '${tree.name}', IsAssy = ${tree.isassy} where QtnId = ${Qtnid} and BaseId = ${baseid} and ParentId = ${parentid}`, (err, updt) => {
                if (err) throw err;

            });
        }
    });
}


// Insert Sub Assembly Parts

function insertSubAssy(Qtnid) {
    console.log("Insert Sub Assembly Parts - in - insertSubAssy(Qtnid)");
    let subassmid = 0;

    qtnQueryMod(`INSERT INTO magodqtn.fab_subassy( AssyID, AssemblyName, UnitLabourCost, Quantity)
        Select BaseId, Name, '0.00',1 from magodqtn.fabrication_assyparts where QtnId = ${Qtnid}  and IsAssy = 1 and Level > 0`,
        async (err, data) => {
            if (err) throw err;
            let id = data.insertId;

            // qtnQueryMod(`INSERT INTO magodqtn.fab_subassy_operations (SubAssyId) values(${id})`, (err, subassyid) => {
            //     if (err) throw err;
            // })

        });
    // });

    return subassmid;
}

//Assembly table with cost details -> Costing Tab 
quoteRouter.post(`/savefab_subassy`, async (req, res, next) => {
    try {
        console.log('savefab_subassy  ' + req.body.quotationNo)

        let cpm = req.body.childpartmtrl;
        let mad = req.body.mainassmdata;
        let pd = req.body.processdata;

        let mlabourcost = req.body.labourcost;
        let mmaterialcost = req.body.materialcost;
        console.log("Main Assm Data : ")
        console.log(mad)
        console.log("Process Data : ")
        console.log(pd)
        let procdata = [];
        for (let z = 0; z < pd.length; z++) {
            procdata.push(pd[z]);
        }
        console.log("New Process Data : ")
        console.log(procdata);
        //  let updtid =  0;
        if (mad.length > 0) {
            for (let i = 0; i < mad.length; i++) {
                if (mad[i]["level"] > 0 && mad[i]["isassy"] == 1) {
                    await qtnQueryMod(`Select * from magodqtn.fab_subassy where AssemblyName = '${mad[i].name}'`, async (err, subassydata) => {
                        if (err) throw err;
                        if (subassydata.length <= 0) {
                            await qtnQueryMod(`INSERT INTO magodqtn.fab_subassy( AssyID, AssemblyName, UnitLabourCost, Quantity)
                            Select BaseId, Name, '0.00',1 from magodqtn.fabrication_assyparts where QtnId = (Select QtnID from magodqtn.qtnlist 
                                where QtnNo = '${req.body.quotationNo.replaceAll("_", "/")}')  and IsAssy = 1 and Level > 0`,
                                async (err, data) => {
                                    if (err) throw err;
                                    let id = data.insertId;
                                    await qtnQueryMod(`INSERT INTO magodqtn.fab_subassy_operations (SubAssyId) values(${id})`, (err, subassyid) => {
                                        if (err) throw err;
                                    })
                                });
                        }
                    });
                    await qtnQueryMod(`UPDATE magodqtn.fab_subassy SET UnitLabourCost = ${mad[i]["labourcost"]}
                             where AssemblyName = '${mad[i].name}'`, async (err, data) => {
                        if (err) throw err;
                        await qtnQueryMod(`UPDATE magodqtn.fabrication_assyparts SET LabourCost = ${mlabourcost}, MaterialCost = ${mmaterialcost}
                                where QtnId = (Select QtnID from magodqtn.qtnlist where QtnNo = '${req.body.quotationNo.replaceAll("_", "/")}') 
                                and Level = 0 and IsAssy = 1`,
                            async (err, data) => {
                                if (err) throw err;
                            });


                        await qtnQueryMod(`Select Id from magodqtn.fab_subassy where AssemblyName = '${mad[i].name}'`, async (err, assyid) => {
                            if (err) throw err;
                            if (assyid.length > 0) {
                                console.log("Processdata ");
                                console.log(pd.length);

                                for (const innerArray of pd) {
                                    for (const item of innerArray) {
                                        const { operation, cost } = item;
                                        await qtnQueryMod(`Select * from magodqtn.fab_subassy_operations where SubAssyId = ${assyid[0]["Id"]} And Operation = '${item.operation}'`,
                                            async (err, assyopn) => {
                                                if (assyopn.length > 0) {
                                                    //Operation = '${operation}',
                                                    await qtnQueryMod(`UPDATE magodqtn.fab_subassy_operations SET 
                                                           Cost = ${item.cost} where SubAssyID = ${assyid[0]["Id"]}`, async (err, data) => {
                                                        if (err) throw err;
                                                    });
                                                } else {
                                                    await qtnQueryMod(`INSERT INTO magodqtn.fab_subassy_operations(SubAssyID, Operation, Cost)
                                                        VALUES (${assyid[0]["Id"]}, '${item.operation}', ${item.cost})`, async (err, data) => {
                                                        if (err) throw err;
                                                    });
                                                }

                                            });
                                    }
                                }
                            }

                        });
                    });

                    qtnQueryMod(`Select * from magodqtn.fabrication_assyparts where QtnId = (Select QtnID from magodqtn.qtnlist 
                        where QtnNo = '${req.body.quotationNo.replaceAll("_", "/")}') and Level = 0`, async (err, fabassyparts) => {
                        if (err) throw err;
                        if (fabassyparts.length > 0) {
                            qtnQueryMod(`Update magodqtn.fab_subassy set UnitLabourCost = ${fabassyparts[0].LabourCost} 
                            where AssyId = ${fabassyparts[0].Id}`, async (err, data) => { });
                        }
                    });

                    console.log("Child Part Material Cost : ");
                    console.log(cpm);

                    if (cpm.length > 0) {
                        for (let j = 0; j < cpm.length; j++) {
                            qtnQueryMod(`Update magodqtn.fab_bom set UnitMaterialCost = ${cpm[j].unitcost}
                                                        where PartName = '${cpm[j].name}'`, async (err, data) => {

                                if (err) throw err;
                            });
                        }
                    }



                }
                res.send({ status: "success" });
            }
        };

    }
    catch (error) {
        next(error);
    }

});

// function insertTreeValues(Qtnid, tree) {
//     console.log("Insert Tree Values");
//     console.log(tree);
//     let assemid = 0;
//     qtnQueryMod(`Select * from magodqtn.fabrication_assyparts where Qtnid = '${Qtnid}'`, async (err, fabassydata) => {
//         if (err) throw err;
//         if (fabassydata.length > 0) {
//             for (let j = 0; j < fabassydata.length; j++) {
//                 qtnQueryMod(`Update magodqtn.fabrication_assyparts set Level = ${tree.level}, Name = '${tree.name}' ,IsAssy = ${tree.isassy}
//             where QtnId = '${Qtnid}' and BaseId = ${fabassydata[j].BaseId} and ParentId = ${fabassydata[j].ParentId}`, async (err, updt) => {
//                     if (err) throw err;
//                     for (let i = 0; i < tree.children.length; i++) {
//                         insertTreeChildValues(Qtnid, fabassydata[i].BaseId, fabassydata[i].ParentId, tree.children[i], childdata);
//                     }
//                 })
//             }
//         } else {
//             qtnQueryMod(`Insert into magodqtn.fabrication_assyparts(QtnId, BaseId,ParentId,Level,Name,IsAssy,Source,MaterialCost,LabourCost) 
//             values (${Qtnid},0,0,${tree.level},'${tree.name}',1,'InHouse','0.00','0.00')`, (err, ins) => {
//                 if (err) throw err;
//                 let baseid = ins.insertId;
//                 qtnQueryMod(`Update magodqtn.fabrication_assyparts set BaseId = ${baseid}, ParentId = ${baseid} 
//                                     where Id = ${baseid}`, (err, updt) => {
//                     if (err) throw err;

//                     for (let i = 0; i < tree.children.length; i++) {
//                         insertTreeChildValues(Qtnid, baseid, baseid, tree.children[i]); //  det[0].BaseId, basedet[0].Id, tree.children[i]);
//                     }
//                 });
//             });
//         }

//     });

//     //     // qtnQueryMod(`Select LAST_INSERT_ID() as BaseId`, (err, baseid) => {
//     //     //     if (err) throw err;
//     //     //                console.log(baseid[0].BaseId)
//     //     let baseid = ins.insertId;
//     //     let treeid = tree.Id;
//     //     qtnQueryMod(`Update magodqtn.fabrication_assyparts set BaseId = ${baseid}, ParentId = ${baseid} 
//     //                         where Id = ${baseid}`, (err, updt) => {
//     //         if (err) throw err;

//     //         for (let i = 0; i < tree.children.length; i++) {
//     //             insertTreeChildValues(Qtnid, baseid, baseid, treeid, tree.children[i]); //  det[0].BaseId, basedet[0].Id, tree.children[i]);
//     //         }

//     //         //});
//     //         assemid = baseid; //[0].BaseId;
//     //     });
//     //     //});
//     // });

//     return assemid;
// }

// Get Fabrication Assy Parts

quoteRouter.post(`/getfabassyparts`, async (req, res, next) => {
    try {
        const { quotationNo } = req.body;
        let tree = {};
        //        console.log("getfabassyparts - " + quotationNo)

        function constructTree(Qtnid, callback) {
            // Assuming you have a function to execute the database query and return the results
            // The function signature may vary based on your database library, so adjust it accordingly.
            function fetchFromDatabase(Qtnid, callback) {
                // Replace this with the appropriate query function for your database
                qtnQueryMod(`SELECT * FROM magodqtn.fabrication_assyparts WHERE QtnId=${Qtnid}`, (err, result) => {
                    if (err) {
                        logger.error(err);
                        callback(err, null);
                    } else {
                        callback(null, result);
                    }
                });
            }

            fetchFromDatabase(Qtnid, (err, data) => {
                if (err) {
                    callback(err, null);
                    return;
                }

                // Helper function to build the tree
                function buildTree(parentId, processedNodes) {
                    let node = data.filter(item => item.ParentId === parentId);
                    if (node.length === 0) return null;

                    processedNodes.add(parentId);

                    node.forEach(item => {
                        if (!processedNodes.has(item.BaseId)) {
                            item.children = buildTree(item.BaseId, processedNodes);
                        }
                    });

                    return node;
                }

                const tree = buildTree(0, new Set()); // Assuming the root node has ParentId = 0
                callback(null, tree);
            });
        }

        qtnQueryMod(`Select QtnID from magodqtn.qtnlist where QtnNo = '${quotationNo.replaceAll("_", "/")}'`, async (err, qtnid) => {
            if (err) logger.error(err);
            if (qtnid.length > 0) {
                let Qtnid = qtnid[0].QtnID;
                //                console.log("Initial -1 Tree");
                constructTree(Qtnid, (err, tree) => {
                    if (err) {
                        logger.error(err);
                        return;
                    }
                    res.send(tree);
                });
            }
        });
    } catch (error) {
        next(error)
    }
});



//Operation / Process Table
quoteRouter.post(`/savefab_subassy_operations`, async (req, res, next) => {
    //    console.log("***************************** Operations *****************************")
    //    console.log(req.body.processdata);
    //    console.log(req.body.mainassmdata);
    try {
        for (let i = 0; i < req.body.mainassmdata.length; i++) {
            let calcost = mainassmdata[i].calculatedcost;
            qtnQueryMod(`Select Id, AssemblyName,  from magodqtn.fab_subassy where AssemblyName=${mainassmdata[i].mainassmname}`, async (err, Assydata) => {
                let proccost = 0;
                for (let j = 0; j < req.body.processdata.length; j++) {
                    proccost = proccost + req.body.processdata[j].unitcost;
                }
                for (let k = 0; k < req.body.processdata.length; k++) {

                    if (calcost == proccost) {
                        qtnQueryMod(`INSERT INTO magodqtn.fab_subassy_operations( AssyID, OperationName, UnitLabourCost, Quantity)
            VALUES (${Assydata[i].Id}, ${req.body.processdata[k].processname}, ${req.body.processdata[k].unitcost}, ${req.body.processdata[k].quantity})`, async (err, data) => {
                            console.log("savefab_subassy_operations");

                        });
                    }
                }
            });

        }
        res.send({ status: "success" })
        //   qtnQueryMod(`Select Id from magodqtn.fab_subassy where where AssyId = ${}`) //magodqtn.fab_subassy_operations
    } catch (error) {
        //      console.log("savefab_subassy_operations error");
        next(error);
    }

});

// Material Cost /Unit table
quoteRouter.post(`/savefab_bom`, async (req, res, next) => {
    //    console.log("******************************** savefab_bom ********************************")
    //    console.log(req.body.assmdata);
    let assmdata = req.body.assmdata;
    try {
        for (let i = 0; i < assmdata.length; i++) {
            qtnQueryMod(`Select Last_Insert_ID() as AssyID`, async (err, AssyID) => {

                qtnQueryMod(`INSERT INTO magodqtn.fab_bom( AssyID, PartName, UnitMaterialCost, Quantity)
            VALUES (${AssyID[0].AssyID}, ${assmdata[i].subassmname}, ${assmdata[i].unitcost}, ${assmdata[i].quantity})`, async (err, data) => {
                    console.log("savefab_bom Inserted");

                });
            });
            res.send({ status: "success" })
        }

    }
    catch (error) {
        next(error);
    }
});

quoteRouter.post(`/gettaskprogrammingrates`, async (req, res, next) => {
    try {
        //  const mtrl = req.body.material;
        //   const opertn = req.body.process;

        // if (!mtrl) res.send(createError.BadRequest())

        qtnQueryMod(`SELECT * FROM magodqtn.programmingratelist p where p.current`, async (err, prgmrtdata) => {
            if (err) logger.error(err);
            //            console.log(prgmrtdata);
            res.send(prgmrtdata)
        })
    }
    catch (error) {
        next(error)
    }
});

quoteRouter.post(`/getquotationlist`, async (req, res, next) => {
    //    console.log('getquotationlist  ' + req.body.qtnstatus + '  ' + req.body.qtnformat)
    //    console.log(req.body)
    try {
        const qtnstatus = req.body.qtnstatus;
        const qtnformat = req.body.qtnformat;
        //        console.log(qtnformat);

        //if ((!qtnformat) && (!qtnstatus)) res.send(createError.BadRequest())
        switch (qtnstatus) {

            case "Created": //"ToSend":
                //   console.log("Created")
                //qtnQuery(`SELECT * FROM magodqtn.QtnList WHERE QtnFormat = '${qtnformat}' AND QtnStatus = 'Created' AND  OrderStatus is null`, async (data) => {
                qtnQueryMod(`SELECT * FROM magodqtn.QtnList WHERE QtnStatus = 'Created' And QtnFormat = '${qtnformat}' order by QtnID desc`, async (err, data) => {
                    if (err) logger.error(err);
                    res.send(data)
                });
                break;
            case "Qtn Sent":

                //qtnQuery(`SELECT * FROM magodqtn.QtnList WHERE QtnFormat = '${qtnformat}' AND QtnStatus = 'Qtn Sent' AND  OrderStatus is null`, async (data) => {
                qtnQueryMod(`SELECT * FROM magodqtn.QtnList WHERE QtnStatus = 'Qtn Sent' And QtnFormat = '${qtnformat}' order by QtnID desc`, async (err, data) => {
                    if (err) logger.error(err);
                    res.send(data)
                });
                break;
            case "No Order":

                //qtnQuery(`SELECT * FROM magodqtn.QtnList WHERE QtnFormat = '${qtnformat}' AND Qtnstatus = 'No Order'`, async (data) => {
                qtnQueryMod(`SELECT * FROM magodqtn.QtnList WHERE Qtnstatus = 'No Order' And QtnFormat = '${qtnformat}' order by QtnID desc`, async (err, data) => {
                    if (err) logger.error(err);
                    res.send(data)
                });
                break;
            case "Order Received":

                //QtnFormat='${qtnformat}' AND
                qtnQuery(`SELECT * FROM magodqtn.QtnList WHERE  QtnStatus = 'Order Received' And QtnFormat = '${qtnformat}' order by QtnID desc`, async (err, data) => {
                    if (err) logger.error(err);
                    res.send(data)
                });
                break;
            case "Closed":

                //QtnFormat='${qtnformat}' AND
                qtnQueryMod(`SELECT * FROM magodqtn.QtnList WHERE  QtnStatus = 'Closed' And QtnFormat = '${qtnformat}' order by QtnID desc`, async (err, data) => {
                    if (err) logger.error(err);
                    res.send(data)
                });
                break;
            case "Cancelled":
                qtnQueryMod(`SELECT * FROM magodqtn.QtnList WHERE QtnFormat = '${qtnformat}' AND QtnStatus = 'Cancelled' order by QtnID desc`, async (err, data) => {
                    if (err) logger.error(err);
                    res.send(data)
                });
                break;
            default:
                qtnQueryMod(`SELECT * FROM magodqtn.QtnList WHERE QtnFormat = '${qtnformat}' order by QtnID desc`, async (err, data) => {
                    if (err) logger.error(err);
                    res.send(data)
                });
                break;
        }
    } catch (error) {
        next(error)
    }
});

quoteRouter.post('/uploaddxf', async (req, res, next) => {
    try {
        const file = req.files.file;
        const quotationNo = req.body.quotationNo;
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][new Date().getMonth()]
        file.mv(`C:/Magod/Jigani/QtnDwg/${month}/${quotationNo}/${file.name}`, (err) => {
            if (err) {
                //            console.log(err)
                logger.error(err);
                res.send({ status: 'failed upload' })
            } else {
                res.send({ status: 'success' })
            }
        })
    } catch (error) {
        next(error)
    }
})

quoteRouter.post('/quotationstatusupdate', async (req, res, next) => {
    try {
        //        console.log(req.body)
        const qtnid = req.body.qtnid;
        const qtnstatus = req.body.qtnstatus;
        const qtnrejreason = req.body.qtnrejreason;
        const qtnreasondesc = req.body.qtnreasondesc;
        let msg = "";
        let qtnrec = "";

        if (!qtnid || !qtnstatus) res.send(createError.BadRequest())
        if (qtnrejreason) {
            qtnQueryMod(`Select * from magodqtn.qtnlist where QtnID = '${qtnid}'`, (err, qtnchk) => {
                if (qtnchk != null) {
                    qtnQueryMod(`Update magodqtn.qtnlist set NoOrder = '${qtnrejreason + qtnreasondesc}', QtnStatus = '${qtnstatus}' where QtnID = '${qtnid}'`, (err, qtnrec) => {
                        res.send({ status: "Quotation Updated Sucessfully.." });
                        return;
                    })
                }
                else {
                    res.send({ status: "Quotation not found.." })
                    return;
                }
            });
        }
        else {
            qtnQueryMod(`Select * from magodqtn.qtnlist where QtnID = '${qtnid}'`, (err, qtnchk) => {
                if (qtnchk != null) {
                    qtnQueryMod(`Update magodqtn.qtnlist set NoOrder = '${qtnreasondesc}', QtnStatus = '${qtnstatus}' where QtnID = '${qtnid}'`, (err, qtnrec) => {
                        res.send({ status: "Quotation Updated Sucessfully.." });
                        return;
                    })
                }
                else {
                    res.send({ status: "Quotation not found.." })
                    return;
                }
            });
        }
    } catch (error) {
        next(error)
    }
})

// quotation - 1

quoteRouter.post(`/quotationinsert`, async (req, res, next) => {

    try {
        const quotationno = req.body.quotationno;
        const qtndate = new Date().now;
        const enquiryDate = new Date().now; //req.body.enquiryDate;
        const enquiryRef = req.body.enquiryRef;
        const customerName = req.body.customerName;
        const custAddress = req.body.custAddress;
        const custcode = req.body.custcode;
        const custTele = req.body.custTele;
        const contact = req.body.contact;
        const e_mail = req.body.e_mail;
        const qtnformat = req.body.qtnformat;

        if (!quotationno || !customerName || !enquiryRef) return res.send(createError.BadRequest());

        await qtnQueryMod(`Select * from magodqtn.qtnlist where qtnno = '${quotationno}'`, (err, qtnchk) => {
            if (qtnchk == null) {
                qtnQueryMod(`Insert into magodqtn.qtnlist (QtnNo,EnquiryDate,QtnDate,Cust_Code,CustomerName,CustAddress,CustTele,EnquiryRef,Contact,E_mail,QtnFormat) values ('${quotationno}', current_date(),'${qtndate}','${custcode}','${customerName}','${custAddress}','${custTele}','${enquiryRef}','${contact}','${e_mail}','${qtnformat}')`, (err, qtnrec) => {
                    res.send({ status: "success" });
                    return;
                });
            } else {
                qtnQueryMod(`Update magodqtn.qtnlist set Cust_Code = '${custcode}',CustomerName = '${customerName}',CustAddress = '${custAddress}',
                CustTele ='${custTele}',EnquiryRef='${enquiryRef}',Contact='${contact}',E_mail='${e_mail}',QtnFormat='${qtnformat}'
                 where qtnno = '${quotationno}'`, (err, qtnrec) => {
                    res.send({ status: "success" });
                    return;
                });
            }

        });

    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/quotestatusupdate`, async (req, res, next) => {
    console.log("quotestatusupdate");
    try {
        qtnQueryMod(`UPDATE magodqtn.qtnlist SET QtnStatus = '${req.body.qtnstatus}' WHERE QtnNo = '${req.body.qtnno}'`, (err, data) => {
            if (err) logger.error(err);
            res.send({ status: "success" });
        });
    } catch (error) { next(error) };
});

// Quotation 2

quoteRouter.post('/updatequotation', async (req, res, next) => {
    //    console.log("update Quotation");
    console.log(req.body);
    // console.log(req.body.qtntaxdata)
    //console.log(req.body.seltcdata);
    try {
        if (req.body.enquiryDate == null || req.body.enquiryDate == undefined) {
            req.body.enquiryDate = new Date().now;
        }
        let vupto = req.body.validupto1;
        console.log("Qtn Value : " + req.body.qtnvalue);
        console.log("Qtn Tax : " + req.body.qtntax);
        console.log("Qtn Total : " + req.body.qtntotal);

        //  let findQtnID = `Select QtnID from magodqtn.qtnlist where QtnNo='${req.body.qtnno}'`;
        // console.log("findQtnID : " + findQtnID);
        qtnQueryMod("Select QtnID from magodqtn.qtnlist where QtnNo='" + req.body.qtnno + "'", (err, qtnidchk) => {
            //    console.log("qtnidchk : " + JSON.stringify(qtnidchk));
            if (qtnidchk != null || qtnidchk != undefined) {

                let qtnid = qtnidchk[0].QtnID;
                qtnQueryMod(`SET SQL_MODE='ALLOW_INVALID_DATES';`, (err, sqlmode) => { });

                qtnQueryMod(`UPDATE magodqtn.qtnlist set QtnNo = '${req.body.qtnno}', EnquiryDate = '${req.body.qtndate}', QtnDate = '${req.body.qtndate}',
                            QtnType = '${req.body.qtntype}', CustomerName = '${req.body.customer}', CustAddress = '${req.body.address}', CustTele = '${req.body.tele}',
                            EnquiryRef = '${req.body.enquiryRef1}', Contact = '${req.body.contact1}', E_mail = '${req.body.email}', Qtn_Value = '${req.body.qtnvalue}',
                            QtnTax = '${req.body.qtntax}', QtnTotal = '${req.body.qtntotal}', Preparedby = '${req.body.formpreparedby}', QtnStatus = 'Created', RevNo = 'null',
                            ValidUpTo = DATE_FORMAT(STR_TO_DATE('${(vupto)}','%d/%m/%Y'), '%Y-%m-%d'),
                            RevisonOf = null, RevQtnDate = curDate() where QtnID = '${qtnid}'`, (err, upd) => {
                    //    QtnFormat = '${req.body.format}', RevisonOf = null, RevQtnDate = curDate() where QtnID = '${qtnid}'`, (err, upd) => {
                    if (err) logger.error(err);
                    //                    console.log(" Updated Qtn List");
                    if (req.body.qtnMaterialData != undefined && req.body.qtnMaterialData.length > 0 && req.body.qtnMaterialData != null) {

                        console.log("Qtn Material Data : " + JSON.stringify(req.body.qtnMaterialData));
                        req.body.qtnMaterialData.forEach(async element => {
                            await qtnQueryMod(`Select * from magodqtn.qtn_itemslist where QtnID = '${qtnid}'
                             and Name = '${element.Name ?? element.itemname}' 
                                and Material = '${element.Material ?? element.material}' and Operation = '${element.Operation ?? element.operation}'`, async (err, qtnrec) => {
                                if (err) logger.error(err);
                                if (qtnrec.length > 0) {
                                    await qtnQueryMod(`UPDATE magodqtn.qtn_itemslist set Quantity = '${element.quantity}', BasePrice = '${element.basicPrice}', DiscountAmount = '${element.discountAmount}'
                                                 where QtnID = '${qtnid}' and Name = '${element.Name ?? element.itemname}'
                                                  and Material = '${element.Material ?? element.material}' 
                                                 and Operation = '${element.Operation ?? element.operation}'`, async (err, upd) => {
                                        if (err) logger.error(err);
                                        //                                       console.log(" Updated Items");
                                    });
                                }
                                else {
                                    await qtnQueryMod(`Delete from magodqtn.qtn_itemslist where QtnID = '${qtnid}'`, async (err, del) => {
                                        if (err) logger.error(err);
                                        await qtnQueryMod(`INSERT INTO magodqtn.qtn_itemslist(QtnID, Name, Material, Operation, Quantity, BasePrice, DiscountAmount) 
                                    Values('${qtnid}','${element.Name ?? element.itemname}','${element.Material ?? element.material}',
                                    '${element.Operation ?? element.operation}','${element.quantity}','${element.basicPrice}',
                                    '${element.discountAmount}')`, (err, ins) => {
                                            if (err) logger.error(err);
                                            //                                       console.log(" Inserted Items");

                                        });
                                    });
                                }
                            });
                        });
                    }
                    if (req.body.selectedtcdata != undefined && req.body.selectedtcdata.length > 0 && req.body.selectedtcdata != null) {
                        // console.log("terms and conditions : " + JSON.stringify(req.body.selectedtcdata));                        
                        req.body.selectedtcdata.forEach(async element => {
                            qtnQueryMod(`Select * from magodqtn.qtn_termsandconditions where QtnID = '${qtnid}' and Terms = '${element.Terms}'`, (err, tcchk) => {
                                if (err) logger.error(err);
                                if (tcchk.length > 0) {
                                    qtnQueryMod(`UPDATE magodqtn.qtn_termsandconditions set Under = '${element.Under}', Terms = '${element.Terms}', 
                                    highlight = ${(element.highlight == true ? 1 : 0)} where QtnID = '${qtnid}' and Terms = '${element.Terms}'`, (err, upd) => {
                                        if (err) logger.error(err);
                                        //                                     console.log(" Updated T & C");

                                    });
                                }
                                else {
                                    qtnQueryMod(`INSERT INTO magodqtn.qtn_termsandconditions(QtnID, Under, Terms, highlight) 
                                    Values( '${qtnid}','${element.Under}','${element.Terms}','${(element.highlight == true ? 1 : 0)}')`, (err, ins) => {
                                        if (err) logger.error(err);
                                        //                                    console.log(" Inserted T & C");
                                    });
                                }


                            });
                        });
                    }
                    if (req.body.qtntaxdata != undefined && req.body.qtntaxdata.length > 0 && req.body.qtntaxdata != null) {
                        console.log("Tax Data : " + JSON.stringify(req.body.qtntaxdata));
                        qtnQueryMod(`Delete from magodqtn.qtntaxes where QtnID = '${qtnid}'`, (err, del) => {
                            if (err) logger.error(err);
                            //  console.log(" Deleted Tax");

                            req.body.qtntaxdata.forEach(elem => {
                                qtnQueryMod(`INSERT INTO magodqtn.qtntaxes(QtnId,TaxName, TaxPercent, TaxableAmount, TaxAmount) 
                                Values('${qtnid}' ,'${elem.taxname}', '${elem.taxpercent}','${elem.taxableamount}','${elem.taxamt}')`, (err, inc) => { });
                                //     console.log("qtnTax")
                                //                          console.log(" Inserted Tax");

                            });

                        });
                    }
                    res.send({ status: "Success" });
                });

                //   return;
            }
        });
    } catch (error) {
        next(error)
    }
});

// Quotation 3

quoteRouter.post('/quotationitemslist', async (req, res, next) => {
    try {
        const qtnNo = req.body.quotationNo; //.replaceAll('_', '/');
        console.log("Quotation Items List : " + qtnNo);
        // const itemslist = req.body.qtnMaterialData;
        const itemslist = req.body.qtnMaterialData;
        console.log("Items List : " + JSON.stringify(itemslist));
        // const name = req.body.itemname;
        // const operation = req.body.operation;
        // const material = req.body.material;
        // const quantity = req.body.quantity;
        // const baseprice = parseFloat(req.body.basePrice);
        // const discountamount = (req.body.discountAmount > 0 ? req.body.discountAmount : 0);

        let msg = "";
        let qtnrec = "";

        //let qtnno = req.body.quotationNo.replaceAll('_', '/');
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnNo}'`);
        // qtnQueryMod(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnNo}'`, (err, qtnidchk) => {
        //               console.log("qtnidchk : " + JSON.stringify(qtnidchk));
        if (findQtnID[0].QtnID != null) {
            //   let qtnid = qtnidchk[0]["QtnID"];
            console.log("quotationitemslist");
            console.log(itemslist.length);
            if (itemslist != null && itemslist.length > 0) {
                console.log(itemslist);
                itemslist.forEach((elem, index) => {
                    qtnQueryMod(`Select * from magodqtn.qtn_itemslist where QtnID = '${findQtnID[0].QtnID}' and Name = '${elem.itemname}' 
                                        and Material = '${elem.material}' and Operation = '${elem.operation}'`, (err, qtnrec) => {
                        if (err) logger.error(err);
                        if (qtnrec.length > 0) {
                            qtnQueryMod(`UPDATE magodqtn.qtn_itemslist set Quantity = '${elem.quantity}', BasePrice = '${elem.basicPrice}',
                                             DiscountAmount = '${elem.discountAmount}'
                                             where QtnID = '${findQtnID[0].QtnID}' and Name = '${elem.itemname}' and Material = '${elem.material}' 
                                             and Operation = '${elem.operation}'`, (err, upd) => {
                                if (err) logger.error(err);
                                //                            console.log(" Updated Qtn List");
                                //  res.send({ status: "Success" });
                            });
                        } else {
                            qtnQueryMod(`INSERT INTO magodqtn.qtn_itemslist(QtnId, Name, Material, Operation, Quantity, BasePrice, DiscountAmount)
                                                values ('${findQtnID[0].QtnID}','${elem.itemname}','${elem.material}','${elem.operation}',${elem.quantity},
                                                ${elem.basicPrice},${elem.discountAmount})`, (err, data) => {
                                if (err) logger.error(err);
                                //   console.log(qtnid);

                                //                    return;
                            });
                        }
                    });
                });
                res.send({ status: "Success" });
            }
        }
        //  });
    } catch (error) {
        next(error)
    }
});

quoteRouter.post('/qtnfinditemslist', async (req, res, next) => {
    try {
        const qtnNo = req.body.qtnno; //.replaceAll('_', '/');
        console.log("Quotation Items List : " + qtnNo);
        // const itemslist = req.body.qtnMaterialData;
        const itemslist = req.body.qtnMaterialData;
        console.log("Items List : ");
        console.log(itemslist);

        let msg = "";
        let qtnrec = "";

        //let qtnno = req.body.quotationNo.replaceAll('_', '/');
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnNo}'`);
        // qtnQueryMod(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnNo}'`, (err, qtnidchk) => {
        //               console.log("qtnidchk : " + JSON.stringify(qtnidchk));
        if (findQtnID[0].QtnID != null) {
            //   let qtnid = qtnidchk[0]["QtnID"];
            console.log("quotationitemslist");
            console.log(itemslist.length);
            if (itemslist != null && itemslist.length > 0) {
                console.log(itemslist);
                itemslist.forEach((elem, index) => {
                    console.log("elem : " + JSON.stringify(elem));
                    qtnQueryMod(`Select * from magodqtn.qtn_itemslist where QtnID = '${findQtnID[0].QtnID}' and Name = '${elem.Name}' 
                                        and Material = '${elem.Material}' and Operation = '${elem.Operation}'`, (err, qtnrec) => {
                        if (err) logger.error(err);
                        if (qtnrec.length > 0) {
                            qtnQueryMod(`UPDATE magodqtn.qtn_itemslist set Quantity = '${elem.Quantity}', BasePrice = '${elem.BasePrice}',
                                             DiscountAmount = '${elem.DiscountAmount}'
                                             where QtnID = '${findQtnID[0].QtnID}' and Name = '${elem.Name}' and Material = '${elem.Material}' 
                                             and Operation = '${elem.Operation}'`, (err, upd) => {
                                if (err) logger.error(err);
                                //                            console.log(" Updated Qtn List");
                                //  res.send({ status: "Success" });
                            });
                        } else {
                            if (elem.Name != "" && elem.Material != "" && elem.Operation != "" && elem.Quantity != "" && elem.BasePrice != ""
                                && elem.DiscountAmount != "") {
                                qtnQueryMod(`INSERT INTO magodqtn.qtn_itemslist(QtnId, Name, Material, Operation, Quantity, BasePrice, DiscountAmount)
                                                values ('${findQtnID[0].QtnID}','${elem.Name}','${elem.Material}','${elem.Operation}',${elem.Quantity},
                                                ${elem.BasePrice},${elem.DiscountAmount})`, (err, data) => {
                                    if (err) logger.error(err);
                                    //   console.log(qtnid);

                                    //                    return;
                                });
                            } else {
                                qtnQueryMod(`INSERT INTO magodqtn.qtn_itemslist(QtnId, Name, Material, Operation, Quantity, BasePrice, DiscountAmount)
                                                values ('${findQtnID[0].QtnID}','${elem.itemname}','${elem.material}','${elem.operation}',${elem.quantity},
                                                ${elem.basicPrice},${elem.discountAmount})`, (err, data) => {
                                    if (err) logger.error(err);
                                    //   console.log(qtnid);

                                    //                    return;
                                });
                            }
                        }
                    });
                });
                res.send({ status: "Success" });
            }
        }
        //  });
    } catch (error) {
        next(error)
    }
});


// Quotation 4

quoteRouter.post('/saveprofilelistdata', async (req, res, next) => {
    console.log("******************* Save Profile List Data ******************")
    try {
        let qtnno = req.body.quotationNo;
        let proflist = req.body.qtnProfileDat;
        let dboperntype = req.body.dboperntype;
        let qtnid = "";

        let month = new Date(Date.now()).toLocaleString('en-US', { month: 'long' });
        if (!qtnno) res.send(createError.BadRequest());
        let qno = qtnno.replaceAll('_', '/');

        //console.log(req.body.qtnProfileDat);
        console.log(proflist[0].file.name);
        if (dboperntype == "Save") {
            await qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qno + "'", async (err, qtnidchk) => {
                if (err) throw err;
                //  if (qtnidchk != null && Object.keys(qtnidchk).length > 0) {
                qtnid = qtnidchk[0].QtnID;
                let foldername = "C:\\\\\\\\Magod\\\\Jigani\\\\QtnDwg\\\\" + month + "\\\\" + qtnno.replaceAll('/', '_');
                //}

                console.log("Qtn Found : " + qtnid);
                await qtnQueryMod(`select * from magodqtn.qtn_profiledetails where QtnId = '${qtnid}'`, async (err, qtnprofchk) => {
                    if (qtnprofchk != null || qtnprofchk.length != 0) {
                        await qtnQueryMod(`Delete from magodqtn.qtn_profiledetails where QtnId = '${qtnid}'`, async (err, del) => {
                            if (err) throw err;
                        });
                        // await qtnQueryMod(`Delete from magodqtn.taskdetails where QtnId = '${qtnid}'`, async (err, del) => {
                        //     if (err) throw err;
                        // });
                        console.log("Proflist : " + JSON.stringify(proflist));

                        proflist.forEach((elem, index) => {

                            qtnQueryMod(`INSERT INTO magodqtn.qtn_profiledetails (QtnId, QtnSrl, Dwg_Name, Path, Pattern, Operation, PartNetArea, mtrl_code, Material,
                                     Thickness, Qty, QtyNested, MtrlGrade, QtnTaskId, InspLevel, Tolerance, LOC, NoofPierces, OutOpen, PartNetWt, PartOutArea, PartOutWt,
                                     Complexity, RectWeight) VALUES('${qtnid}', '${(index + 1)}', '${elem.file.name}', '${foldername}', '.dxf',
                                      '${elem['operation']}', '${elem.partNetArea > 0 ? elem.partNetArea : elem.partnetarea}', '${elem.materialcode}','${elem.material}', '${elem.thickness}', 
                                      '${elem.quantity}', '${elem.quantity}', '${elem.grade}', '0', '${elem.inspectionlevel}', '${elem.tolerance}'
                                      , '${elem.lengthOfCut}', '${elem.noOfPierces}', '${(elem.outOpen == true ? -1 : 0)}', 
                                      '${elem.partNetWeight > 0 ? elem.partNetWeight : elem.partnetwt}', 
                                      '${elem.partOutArea > 0 ? elem.partOutArea : elem.partoutarea}', 
                                      '${elem.partOutWeight > 0 ? elem.partOutWeight : elem.partoutwt}', '${elem.complexity}', 
                                      '${elem.rectWeight > 0 ? elem.rectWeight : elem.rectweight}')`, async (err, inc) => {
                                if (err) { logger.error(err); }


                            });

                        });

                    }
                });
            });
            await qtnQueryMod(`Select * from magodqtn.qtn_profiledetails where QtnId = '${qtnid}'`, async (err, qtnprofchk) => {
                //      console.log(qtnprofchk);
                res.send({ qtnprofchk, status: "Saved" });
            });
        } else if (dboperntype == "Delete") {
            // qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qno + "'", (err, qtnidchk) => {
            //     if (err) logger.error(err);
            //     if (qtnidchk != null && qtnidchk.length > 0) {
            //         let qtnid = qtnidchk[0].QtnID;
            //         let foldername = "C:\\\\\\\\Magod\\\\Jigani\\\\QtnDwg\\\\" + month + "\\\\" + qtnno;

            qtnQueryMod(`DELETE FROM magodqtn.taskdetails WHERE QtnId = '${qtnid}' `, (err, tdets) => {
                if (err) logger.error(err);

                qtnQueryMod(`DELETE FROM magodqtn.magodqtn.qtntasklist WHERE QtnId = '${qtnid}' `,
                    (err, taskdel) => {
                        if (err) logger.error(err);
                        qtnQueryMod(`DELETE FROM magodqtn.qtn_profiledetails WHERE QtnId = '${qtnid}' `,
                            (err, inc) => {
                                if (err) logger.error(err);
                                res.send({ status: "Delete" });
                            });
                    });

            });

            //  return;
        }

    }
    catch (error) {
        next(error)
    }
});


quoteRouter.post('/updsaveprofilelistdata', async (req, res, next) => {
    console.log("******************* Upd Save Profile List Data ******************")
    try {
        let qtnno = req.body.quotationNo;
        let proflist = req.body.qtnProfileDat;
        let dboperntype = req.body.dboperntype;


        let qtnid = "";

        let month = new Date(Date.now()).toLocaleString('en-US', { month: 'long' });
        if (!qtnno) res.send(createError.BadRequest());
        let qno = qtnno.replaceAll('_', '/');

        if (dboperntype == "Save") {
            await qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qno + "'", async (err, qtnidchk) => {
                if (err) throw err;
                //  if (qtnidchk != null && Object.keys(qtnidchk).length > 0) {
                qtnid = qtnidchk[0].QtnID;
                let foldername = "C:\\\\\\\\Magod\\\\Jigani\\\\QtnDwg\\\\" + month + "\\\\" + qtnno.replaceAll('/', '_');
                //}

                console.log("Qtn Found : " + qtnid);
                await qtnQueryMod(`select * from magodqtn.qtn_profiledetails where QtnId = '${qtnid}'`, async (err, qtnprofchk) => {
                    if (qtnprofchk != null || qtnprofchk.length != 0) {
                        await qtnQueryMod(`Delete from magodqtn.qtn_profiledetails where QtnId = '${qtnid}'`, async (err, del) => {
                            if (err) throw err;
                        });
                        console.log("Profile list-1");
                        proflist.forEach((elem, index) => {
                            let dgname = elem.Dwg_Name ?? elem.file.name;
                            qtnQueryMod(`INSERT INTO magodqtn.qtn_profiledetails (QtnId, QtnSrl, Dwg_Name, Path, Pattern, Operation, PartNetArea, mtrl_code, Material,
                                     Thickness, Qty, QtyNested, MtrlGrade, QtnTaskId, InspLevel, Tolerance, LOC, NoofPierces, OutOpen, PartNetWt, PartOutArea, PartOutWt,
                                     Complexity, RectWeight) VALUES('${qtnid}', '${(index + 1)}', '${dgname}', '${foldername}', '.dxf',
                                      '${elem['operation']}', '${elem.partNetArea > 0 ? elem.partNetArea : elem.partnetarea}', '${elem.materialcode}','${elem.material}', '${elem.thickness}', 
                                      '${elem.quantity}', '${elem.quantity}', '${elem.grade}', '0', '${elem.InspLevel}', '${elem.Tolerance}'
                                      , '${elem.lengthOfCut}', '${elem.noOfPierces}', '${(elem.outOpen == true ? -1 : 0)}', 
                                      '${elem.partNetWeight > 0 ? elem.partNetWeight : elem.partnetwt}', 
                                      '${elem.partOutArea > 0 ? elem.partOutArea : elem.partoutarea}', 
                                      '${elem.partOutWeight > 0 ? elem.partOutWeight : elem.partoutwt}', '${elem.complexity}', 
                                      '${elem.rectWeight > 0 ? elem.rectWeight : elem.rectweight}')`, async (err, inc) => {
                                if (err) { logger.error(err); }

                                // await qtnQueryMod(`INSERT INTO magodqtn.taskdetails (QtnId, TaskNo, Dwg_Name, PartNetWt, PartOutWt, PartOutArea,
                                //     PartNetArea, Complexity, RectWeight, Material, Thickness, Qty, QtyNested, MtrlGrade, InspLevel, Tolerance, LOC, NoofPierces, OutOpen) 
                                //     VALUES('${qtnid}', '${(index + 1)}', '${elem.file.name}', '${elem.partNetWeight > 0 ? elem.partNetWeight : elem.partnetwt}', 
                                //     '${elem.partOutWeight > 0 ? elem.partOutWeight : elem.partoutwt}', '${elem.partOutArea > 0 ? elem.partOutArea : elem.partoutarea}', 
                                //     '${elem.partNetArea > 0 ? elem.partNetArea : elem.partnetarea}', '${elem.complexity}', '${elem.rectWeight > 0 ? elem.rectWeight : elem.rectweight}', 
                                //     '${elem.materialcode}', '${elem.thickness}', '${elem.quantity}', '${elem.quantity}', '${elem.grade}', '${elem.inspectionlevel}', 
                                //     '${elem.tolerance}', '${elem.lengthOfCut}', '${elem.noOfPierces}', '${(elem.outOpen == true ? -1 : 0)}')`, async (err, inc) => {
                                //     if (err) { logger.error(err); }
                                // });
                            });

                        });

                    } else {
                        console.log("Profile list-2");
                        proflist.forEach((elem, index) => {

                            qtnQueryMod(`INSERT INTO magodqtn.qtn_profiledetails (QtnId, QtnSrl, Dwg_Name, Path, Pattern, Operation, PartNetArea, mtrl_code, Material,
                                     Thickness, Qty, QtyNested, MtrlGrade, QtnTaskId, InspLevel, Tolerance, LOC, NoofPierces, OutOpen, PartNetWt, PartOutArea, PartOutWt,
                                     Complexity, RectWeight) VALUES('${qtnid}', '${(index + 1)}', '${dgname}', '${foldername}', '.dxf',
                                      '${elem['operation']}', '${elem.partNetArea > 0 ? elem.partNetArea : elem.partnetarea}', '${elem.materialcode}','${elem.material}', '${elem.thickness}', 
                                      '${elem.quantity}', '${elem.quantity}', '${elem.grade}', '0', '${elem.inspectionlevel}', '${elem.tolerance}',
                                      '${elem.lengthOfCut}', '${elem.noOfPierces}', '${(elem.outOpen == true ? -1 : 0)}', 
                                      '${elem.partNetWeight > 0 ? elem.partNetWeight : elem.partnetwt}', 
                                      '${elem.partOutArea > 0 ? elem.partOutArea : elem.partoutarea}', 
                                      '${elem.partOutWeight > 0 ? elem.partOutWeight : elem.partoutwt}', '${elem.complexity}', 
                                      '${elem.rectWeight > 0 ? elem.rectWeight : elem.rectweight}')`, async (err, inc) => {
                                if (err) { logger.error(err); }

                                // await qtnQueryMod(`INSERT INTO magodqtn.taskdetails (QtnId, TaskNo, Dwg_Name, PartNetWt, PartOutWt, PartOutArea,
                                //     PartNetArea, Complexity, RectWeight, Material, Thickness, Qty, QtyNested, MtrlGrade, InspLevel, Tolerance, LOC, NoofPierces, OutOpen) 
                                //     VALUES('${qtnid}', '${(index + 1)}', '${elem.file.name}', '${elem.partNetWeight > 0 ? elem.partNetWeight : elem.partnetwt}', 
                                //     '${elem.partOutWeight > 0 ? elem.partOutWeight : elem.partoutwt}', '${elem.partOutArea > 0 ? elem.partOutArea : elem.partoutarea}', 
                                //     '${elem.partNetArea > 0 ? elem.partNetArea : elem.partnetarea}', '${elem.complexity}', '${elem.rectWeight > 0 ? elem.rectWeight : elem.rectweight}', 
                                //     '${elem.materialcode}', '${elem.thickness}', '${elem.quantity}', '${elem.quantity}', '${elem.grade}', '${elem.inspectionlevel}', 
                                //     '${elem.tolerance}', '${elem.lengthOfCut}', '${elem.noOfPierces}', '${(elem.outOpen == true ? -1 : 0)}')`, async (err, inc) => {
                                //     if (err) { logger.error(err); }
                                // });
                            });

                        });
                    }
                });
            });
            await qtnQueryMod(`Select * from magodqtn.qtn_profiledetails where QtnId = '${qtnid}'`, async (err, qtnprofchk) => {
                if (qtnprofchk.length > 0) {
                    res.send({ qtnprofchk, status: "Saved" });
                } else {
                    res.send({ qtnprofchk, status: "No Records" });
                }
            });
        } else if (dboperntype == "Delete") {
            // qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qno + "'", (err, qtnidchk) => {
            //     if (err) logger.error(err);
            //     if (qtnidchk != null && qtnidchk.length > 0) {
            //         let qtnid = qtnidchk[0].QtnID;
            //         let foldername = "C:\\\\\\\\Magod\\\\Jigani\\\\QtnDwg\\\\" + month + "\\\\" + qtnno;

            qtnQueryMod(`DELETE FROM magodqtn.taskdetails WHERE QtnId = '${qtnid}' `, (err, tdets) => {
                if (err) logger.error(err);

                qtnQueryMod(`DELETE FROM magodqtn.magodqtn.qtntasklist WHERE QtnId = '${qtnid}' `,
                    (err, taskdel) => {
                        if (err) logger.error(err);
                        qtnQueryMod(`DELETE FROM magodqtn.qtn_profiledetails WHERE QtnId = '${qtnid}' `,
                            (err, inc) => {
                                if (err) logger.error(err);
                                res.send({ status: "Delete" });
                            });
                    });

            });

            //  return;
        }

    }
    catch (error) {
        next(error)
    }
});

quoteRouter.post(`/updatetaskdetails`, async (req, res, next) => {
    try {
        const qtnno = req.body.qtnNo;
        const tsklist = req.body.taskList;
        const findQtnID = await qtnQueryPromise(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`);
        tsklist.forEach(async (elem, index) => {
            await qtnQueryMod(`Update magodqtn.taskdetails set PartNetWt = '${elem.PartNetWt}', PartOutWt = '${elem.PartOutWt}', 
          PartOutArea = '${elem.PartOutArea}', 
            where Qtnid = '${findQtnID[0].QtnID}' and TaskNo = '${elem.TaskNo}' And Dwg_Name = '${elem.Dwg_Name}`, async (err, data) => {
                if (err) logger.error(err);

            });
        });
        res.send({ status: "Success" });
    } catch (error) {
        next(error)
    }
})


quoteRouter.post('/updatetaskdetailsdata', async (req, res, next) => {
    console.log("******************* Update Task Details Data line : 1804 ******************")
    console.log("Update Task Details Data : " + JSON.stringify(req.body));
    try {
        const qtnno = req.body.quotationno;
        const tasknumber = req.body.tskno;
        //     console.log("tskno : " + req.body.tskno);
        //    console.log("Task Number : " + tasknumber);
        const tnetwt = req.body.taskNetWt;
        const tgdata = req.body.taskdetsdata;
        const pfdata = req.body.qtnprofdata;

        let findQtnID = await qtnQueryPromise(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`);
        await qtnQueryMod(`SELECT TaskNo, Task_Net_wt,QtnTaskId from magodqtn.qtntasklist 
        where QtnId = '${findQtnID[0].QtnID}' And TaskNo = ${tasknumber}`, async (err, datamsg) => {
            if (err) logger.error(err);
            //  for (let m = 0; m < datamsg.length; m++) {

            for (let i = 0; i < tgdata.length; i++) {
                if (tgdata[i].TaskNo == tasknumber) {     // datamsg[0].TaskNo) {
                    //            console.log("Task No qtn task : " + datamsg[0].TaskNo + " -  tgdata : " + tgdata[i].TaskNo)

                    // qtnQueryMod(`UPDATE magodqtn.qtntasklist set Task_Net_Wt = '${datamsg.TaskNetWt}' 
                    // where QtnId = '${qtndata[0].QtnID}' and TaskNo = '${datamsg[m].TaskNo}'`, (err, data) => {
                    //     if (err) logger.error(err);
                    // });
                    // console.log(tgdata[i].Material);
                    // console.log(i + " - " + tgdata[i].Pgm_Charge);
                    // console.log(i + " " + JSON.stringify(tgdata[i]));

                    let UMCost = 0;
                    if (tgdata[i].Unit_Material_Cost > 0) {
                        UMCost = tgdata[i].Unit_Material_Cost;
                    } else if (tgdata[i].Unit_Material_cost > 0) {
                        UMCost = tgdata[i].Unit_Material_cost;
                    } else {
                        UMCost = 0;
                    }


                    await qtnQueryMod(`UPDATE magodqtn.taskdetails set  Operation= '${tgdata[i].Operation}', Material= '${tgdata[i].Material}',
                            MtrlGrade ='${tgdata[i].MtrlGrade}',Thickness = '${tgdata[i].Thickness}', Tolerance = '${tgdata[i].Tolerance}', 
                            InspLevel='${tgdata[i].InspLevel}', mtrl_code='${tgdata[i].mtrl_code}', Pgm_Charge_Task='${parseFloat(tgdata[i].Pgm_Charge).toFixed(2)}',
                            SetUp_Loading_Charge_Task='${parseFloat(tgdata[i].SetUp_Loading_Charge).toFixed(2)}', Material_Handling_Cost_Task='${tgdata[i].Material_Handling_Charge}',
                            Cutting_Charge='${tgdata[i].Cutting_Charge}', Unit_JobWork_Cost = ${tgdata[i].Unit_JobWork_Cost}, 
                            Unit_Material_cost = '${UMCost}' 
                            where QtnId = '${findQtnID[0].QtnID}' and TaskNo = '${datamsg[0].TaskNo}' and QtnTaskId = '${datamsg[0].QtnTaskId}' 
                            and Dwg_Name = '${tgdata[i].Dwg_Name}'`, async (err, data) => {

                        if (err) logger.error(err);


                        await qtnQueryMod(`UPDATE magodqtn.qtn_profiledetails set Unit_JobWork_Cost = ${tgdata[i].Unit_JobWork_Cost}, 
                            Unit_Material_cost = '${tgdata[i].Unit_Material_Cost <= 0 ? tgdata[i].Unit_Material_cost : tgdata[i].Unit_Material_Cost}',
                            Cutting_Charge = '${tgdata[i].Cutting_Charge}', Pgm_Charge_Task = '${tgdata[i].Pgm_Charge}',
                            SetUp_Loading_Charge_Task = '${tgdata[i].SetUp_Loading_Charge}'
                            Where QtnId = '${findQtnID[0].QtnID}' and QtnTaskId = '${datamsg[0].QtnTaskId}' 
                            and Dwg_Name = '${tgdata[i].Dwg_Name}'`, async (err, data) => {
                            if (err) logger.error(err);
                            console.log("Updated Profile Details");

                        });
                    });
                }
            };
            // }
            qtnQueryMod(`Select * from magodqtn.taskdetails where QtnId = '${findQtnID[0].QtnID}'`, (err, taskdets) => {
                if (err) logger.error(err);
             //   console.log("Task Details : " + JSON.stringify(taskdets));
                res.send({ status: "Success", taskdets: taskdets });
            });
        });
    } catch (error) {
        next(error)
    }
});

quoteRouter.post('/updateqtntasklistwts', async (req, res, next) => {
    //   console.log("Suresh " + JSON.stringify(req.body));
    console.log("*** Update Quotation Task List Wts ******************")
    try {
        const qtnno = req.body.quotationNo;
        const tskNetArea = req.body.taskNetArea;
        const tskRectArea = req.body.taskRectArea;
        const tskNetWeight = req.body.taskNetWeight;
        const tskRectWeight = req.body.taskRectWeight;
        const tskMtrlArea = req.body.taskMtrlArea;
        const tskMtrlWeight = req.body.taskMtrlWeight;

        const taskNo = req.body.tskno;
        const taskloc = req.body.tkloc;
        const taskpierces = req.body.tkholes;

        console.log("Task Net Area : " + tskNetArea);
        //const taskloc = req.body.taskLOC;
        //const taskpierces = req.body.taskpierces;

        //  console.log("Task LOC : " + taskloc);
        //  console.log("Task Pierces : " + taskpierces);

        const findQtnID = await qtnQueryPromise(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`);
        // tasklist.forEach(async (elem, index) => {
        //, TaskLOC = '${(taskloc > 0 ? taskloc : 0)}', TaskHoles = '${(taskpierces > 0 ? taskpierces : 0)}'
        await qtnQueryMod(`UPDATE magodqtn.qtntasklist set TaskNetArea = '${tskNetArea}',Task_Net_Wt = '${tskNetWeight}', 
            TaskPartRectArea = '${tskRectArea}',TaskRectWeight = '${tskRectWeight}',Task_Mtrl_Weight = '${tskMtrlWeight}', TaskMtrlArea = '${tskMtrlArea}', 
            TaskPartArea = '${tskRectArea}' 
          where Qtnid = '${findQtnID[0].QtnID}' and TaskNo = '${taskNo}'`, async (err, data) => {
            if (err) logger.error(err);
        });
        //});
        res.send({ status: "Success" });
    } catch (error) {
        next(error)
    }
});


quoteRouter.post('/gettaskdetailsbytaskno', async (req, res, next) => {
    console.log("Get Task Details Data By TaskNo : " + req.body.taskno);
    try {
        const qtnno = req.body.quotationNo;
        console.log(qtnno)
        const taskno = req.body.tskno;
        console.log(taskno);
        await qtnQueryMod(`Select QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`, async (err, qtnidchk) => {
            console.log("line - 1818 : " + JSON.stringify(qtnidchk))
            if (err) logger.error(err);
            await qtnQueryMod(`Select * from magodqtn.taskdetails where QtnID = '${qtnidchk[0].QtnID}' and TaskNo = '${taskno}'`, (err, data) => {
                if (err) logger.error(err);
                console.log(JSON.stringify(data));
                res.send(data);
                //  return;
            });
        });
    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/updqtntasklistjw`, async (req, res, next) => {
    console.log("Update Quotation Task List Data");
    try {
        //    console.log(req.body);
        const qtnno = req.body.quotationno;
        const taskno = req.body.taskno;
        const jwrate = req.body.taskjwrate;
        const taskdets = req.body.taskdets;

        console.log(jwrate);

        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`);

        await qtnQueryMod(`Update magodqtn.qtntasklist set Task_Qtn_JW_Rate = ${jwrate} 
                where QtnID = '${findQtnID[0].QtnID}' and TaskNo = ${taskno}`, (err, data) => {
            if (err) logger.error(err);
        });

        console.log("Task Dets : " + JSON.stringify(taskdets));

        taskdets.forEach((item) => {
            qtnQueryMod(`Update magodqtn.taskdetails set Unit_JobWork_Cost = ${item.Unit_JobWork_Cost}
                where QtnID = '${findQtnID[0].QtnID}' and TaskNo = ${taskno} and Dwg_Name = '${item.Dwg_Name}'`, (err, data) => {
                if (err) logger.error(err);
            });

            qtnQueryMod(`Update magodqtn.qtn_profiledetails set Unit_JobWork_Cost = ${item.Unit_JobWork_Cost}
            where QtnID = '${findQtnID[0].QtnID}' and Dwg_Name = '${item.Dwg_Name}'`, (err, data) => {
                if (err) logger.error(err);
            });
        });
        res.send({ status: "Success" });

    } catch (error) {
        next(error)
    }
});

// Material Recalc Update
quoteRouter.post(`/updqtntasklistmtrl`, async (req, res, next) => {
    console.log("Update Quotation Task List Data");
    try {
        //    console.log(req.body);
        const qtnno = req.body.quotationno;
        const taskno = req.body.taskno;
        const jwrate = req.body.taskmtrlrate;
        const taskdets = req.body.taskdets;

        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`);

        await qtnQueryMod(`Update magodqtn.qtntasklist set Task_Qtn_Mtrl_Rate = ${jwrate} 
                where QtnID = '${findQtnID[0].QtnID}' and TaskNo = ${taskno}`, (err, data) => {
            if (err) logger.error(err);
        });
        taskdets.forEach((item) => {
            qtnQueryMod(`Update magodqtn.taskdetails set Unit_Material_cost = ${item.Unit_Material_cost > 0 ? item.Unit_Material_cost : item.Unit_Material_Cost}
                where QtnID = '${findQtnID[0].QtnID}' and TaskNo = ${taskno} and Dwg_Name = '${item.Dwg_Name}'`, (err, data) => {
                if (err) logger.error(err);
            });

            qtnQueryMod(`Update magodqtn.qtn_profiledetails set Unit_Material_cost = ${item.Unit_Material_cost > 0 ? item.Unit_Material_cost : item.Unit_Material_Cost}
            where QtnID = '${findQtnID[0].QtnID}' and Dwg_Name = '${item.Dwg_Name}'`, (err, data) => {
                if (err) logger.error(err);
            });
        });
        res.send({ status: "Success" });

    } catch (error) {
        next(error)
    }
});


quoteRouter.post(`/getqtntasklistbytaskno`, async (req, res, next) => {
    console.log("Get Quotation Task List Data from Db")
    try {
        //     console.log("Part Get Quotation Task List Data");
        //console.log(req.body);
        const qtnno = req.body.quotationNo;
        const tskno = req.body.tskno;
        console.log(tskno);
        //   console.log("line - 1818 : " + JSON.stringify(req.body.quotationNo))
        //  if (!qtnno) return res.send(createError.BadRequest())

        qtnQueryMod(`Select QtnID from magodqtn.qtnlist where QtnNo = '${req.body.quotationNo}'`, (err, qtnidchk) => {
            if (err) logger.error(err);
            //      console.log("Got Qtn ID");
            console.log(qtnidchk[0].QtnID);
            if (tskno == '' || tskno == undefined || tskno == null) {
                qtnQueryMod(`Select * from magodqtn.qtntasklist where QtnID = '${qtnidchk[0].QtnID}'`, (err, data) => {
                    if (err) logger.error(err);
                    console.log(data);
                    res.send(data);
                })
            } else {
                qtnQueryMod(`Select * from magodqtn.qtntasklist where QtnID = '${qtnidchk[0].QtnID}' And TaskNo = '${tskno + 1}'`, (err, data) => {
                    if (err) logger.error(err);
                    //          console.log("Part Get Quotation Task List Data - inside");
                    console.log(data)
                    res.send(data);
                    // return;
                });
            }

        });

    } catch (error) {
        next(error)
    }
});


quoteRouter.post(`/getqtntasklistdata`, async (req, res, next) => {

    try {
        //     console.log("Part Get Quotation Task List Data");
        //    console.log(req.body);
        // const qtnno = req.body.quotationNo;
        //      console.log("line - 1818 : " + JSON.stringify(req.body.quotationNo))
        //  if (!qtnno) return res.send(createError.BadRequest())
        console.log(req.body.quotationNo);
        qtnQueryMod(`Select * from magodqtn.qtnlist where QtnNo = '${req.body.quotationNo}'`, (err, qtnidchk) => {
            if (err) logger.error(err);
            //      console.log("Got Qtn ID");
            console.log(qtnidchk[0].QtnID);
            qtnQueryMod(`Select * from magodqtn.qtntasklist where QtnID = '${qtnidchk[0].QtnID}'`, (err, data) => {
                if (err) logger.error(err);
                //          console.log("Part Get Quotation Task List Data - inside");
                res.send(data);
                // return;
            });
        });

    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/gettaskdetailsdata`, async (req, res, next) => {
    console.log("Get Task Details Data");
    try {
        const qtnno = req.body.quotationNo;
        console.log(req.body);
        // const taskno = req.body.taskno;

        if (!qtnno) return res.send(createError.BadRequest())
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`);

        // qtnQueryMod(`Select * from magodqtn.qtnlist where QtnNo = '${qtnno}'`, (err, qtnidchk) => {
        //     if (err) logger.error(err);
        //  qtnQueryMod(`Select * from magodqtn.taskdetails where QtnID = '${findQtnID[0].QtnID}' and TaskNo = '${taskno}'`, (err, data) => {
        qtnQueryMod(`Select * from magodqtn.taskdetails where QtnID = '${findQtnID[0].QtnID}'`, (err, data) => {
            if (err) logger.error(err);
            console.log(data);
            res.send(data);
            // return;
        });
        // });
    } catch (error) {
        next(error)
    }
});

quoteRouter.post('/quotationtasklistinsert', async (req, res, next) => {
    try {
        //    console.log(req.body)
        const qtnid = req.body.qtnid;
        const taskno = req.body.taskno;
        const operation = req.body.operation;
        const material = req.body.material;
        const mtrlgrade = req.body.mtrlgrade;
        const thickness = req.body.thickness;
        const tolerance = req.body.tolerance;
        const insplevel = req.body.insplevel;
        const mtrlcode = req.body.mtrlcode;

        let msg = "";
        let qtnrec = "";

        if (!qtnid || !taskno) return res.send(createError.BadRequest())
        // qtnQueryMod(`Delete from magodqtn.qtntasklist where Qtnid = '${qtnid}'`,(err,datamsg) => {
        //     if (err) logger.error(err);
        // })

        for (i = 0; i <= tasks.length; i++) {
            qtnQueryMod(`Insert into magodqtn.qtntasklist(TaskNo, QtnID, Operation, material, MtrlGrade, Thickness, Tolerance, InspLevel, Mtrl_Code) 
            values('${(i + 1)}', '${qtnid}', '${operation}', '${material}', '${mtrlgrade}', '${thickness}', '${tolerance},'${insplevel}','${mtrlcode}')`, (err, data) => {
                if (err) logger.error(err);
            });
            //=============================================================================
            qtnQueryMod(`Insert into magodqtn.taskdetails(ProfileId, QtnTaskId, QtnId, TaskNo, Dwg_Name, Path, Pattern, Operation, Material, MtrlGrade, 
                Thickness, Tolerance, Qty, Remarks, DwgExists, InspLevel) Select q.ProfileId,q.QtnTaskId,q.QtnId,qtl.TaskNo,q.Dwg_Name,q.Path,q.Pattern,q.Operation,
                q.mtrl_code,q.Material,q.MtrlGrade,q.Thickness,q.Tolerance,q.Qty,q.Remarks,q.DwgExists,q.InspLevel 
                from magodqtn.qtn_profiledetails q 
                inner join magodqtn.qtntasklist qtl on qtl.QtnId = q.QtnId
                where q.QtnId = '${qtnid}'`, (err, data) => {
                if (err) logger.error(err);
            });
            //=========================================================
        }

        res.send({ status: "Quotation Task Created Sucessfully.." });
        return;

    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/deleteqtntaskdetails`, async (req, res, next) => {
    try {
        //     console.log("deleteqtntaskdetails -    Delete Quotation Task Details : " + req.body.quotationNo);
        //    console.log(req.body);
        const qtnno = req.body.quotationNo;

        if (!qtnno) return res.send(createError.BadRequest())
        qtnQueryMod(`Select * from magodqtn.qtnlist where QtnNo = '${req.body.quotationNo}'`, (err, qtnidchk) => {
            if (err) logger.error(err);
            qtnQueryMod(`Delete from magodqtn.qtntasklist where QtnId = '${qtnidchk[0].QtnID}'`, (err, data1) => {
                if (err) logger.error(err);
                qtnQueryMod(`Delete from magodqtn.taskdetails where QtnId = '${qtnidchk[0].QtnID}'`, (err, data) => {
                    if (err) logger.error(err);
                    res.send({ status: "Success" });
                    return;
                });
            });
        });
    } catch (error) {
        next(error)
    }

});

quoteRouter.post(`/deleteqtntasklist`, async (req, res, next) => {
    console.log("Delete Quotation Task List");
    try {
        const qtnno = req.body.quotationNo;

        if (!qtnno) return res.send(createError.BadRequest())
        qtnQueryMod(`Select * from magodqtn.qtnlist where QtnNo = '${qtnno}'`, (err, qtnidchk) => {
            if (err) logger.error(err);
            qtnQueryMod(`Delete from magodqtn.qtntasklist where QtnId = '${qtnidchk[0].QtnID}'`, (err, data) => {
                if (err) logger.error(err);
                res.send({ status: "Success" });
                //  return;
            });
        });
    } catch (error) {
        next(error)
    }

});

quoteRouter.delete(`/deleteqtnitemslist`, async (req, res, next) => {
    try {
        //    console.log("Delete Quotation Profile Details");
        //    console.log(req.body);
        const qtnno = req.body.quotationNo;

        if (!qtnno) return res.send(createError.BadRequest())
        qtnQueryMod(`Select * from magodqtn.qtnlist where QtnNo = '${qtnno}'`, (err, qtnidchk) => {
            if (err) logger.error(err);
            qtnQueryMod(`Delete from magodqtn.qtn_itemslist where Qtnid = '${qtnidchk[0].qtnid}'`, (err, data) => {
                if (err) logger.error(err);
                res.send({ status: "Success" });
                return;
            });
        });
    } catch (error) {
        next(error)
    }

});



quoteRouter.post(`/getestimate`, async (req, res, next) => {
    console.log("************************  Get Estimate *******************************")
    try {

        const qno = req.body.qtnNo.replaceAll("_", "/");
        //  const quotno = rea.body.qno.split("-");
        let btntyp = req.body.btntype;
        let dType = req.body.doctype; //+ "|" + req.body.btntype;

        // let QuoteId = 0;
        //   let dctype = req.body.btntyp;
        //      console.log(dType);
        //      console.log(btntyp);

        qtnQueryMod(`SELECT QtnID from magodqtn.qtnlist where QtnNo = '${qno}'`, async (err, qtniddata) => {
            if (err) logger.error(err);
            console.log(qtniddata);
            console.log("Button Type : " + btntyp);
            console.log("Quote ID : " + qtniddata[0]["QtnID"]);
            console.log("Document Type : " + dType);

            QuoteId = qtniddata[0]["QtnID"];
            // documentType: "Quotation"
            axios.post(process.env.ESTAPI_URL, {
                //axios.post("http://192.168.29.123:25125/post", {

                quotationNo: qtniddata[0]["QtnID"].toString(),
                documentType: dType, readOption: btntyp
            })
                .then((response) => {
                    try {
                        // qtnQueryMod(`SELECT p.*,q.* FROM magodqtn.qtn_profiledetails p
                        // left outer join magodqtn.qtntasklist q on q.QtnTaskID = p.QtnTaskId
                        //  where p.QtnID = ${QuoteId}`, (err, data) => {
                        qtnQueryMod(`SELECT q.* FROM magodqtn.qtntasklist q
                             where q.QtnID = ${QuoteId}`, (err, data) => {
                            if (err) logger.error(err);
                            console.log("********** Get Estimate Data **************");
                            console.log(data);
                            res.send(data)
                        })
                    } catch (error) {
                        next(error)
                    }
                    //   console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                })


            //  res.send(qtniddata.QtnID);
        })
    }
    catch (error) {
        next(error)
    }
});


quoteRouter.post('/saveqtntaxdetails', async (req, res, next) => {
    //    console.log("Saving Tax Details");
    try {
        let qtnno = req.body.qtnno;
        let qtxdata = req.body.qtntaxdata;
        qtnno = qtnno.replaceAll('_', '/');
        qtnQueryMod("Select QtnID from magodqtn.qtnlist where QtnNo='" + qtnno + "'", (err, qtnidchk) => {
            if (err) logger.error(err);
            if (qtnidchk != null) {
                let qtnid = qtnidchk[0].QtnID;
                qtxdata.forEach(elem => {
                    qtnQueryMod("INSERT INTO magodqtn.qtntaxes(QtnId,TaxName, TaxPercent, TaxableAmount, TaxAmount) Values('" + qtnid + "','" + elem.taxname + "','" + elem.taxpercent + "','" + elem.taxableamount + "','" + elem.taxamt + "')", (err, inc) => { });
                    //                  console.log("qtnTax")
                });
                res.send({ status: "Success" });
            }
        })
    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/qtnitemsdeleteandsave`, async (req, res, next) => {
    try {
        console.log("Import rates");
        // console.log(req.body);
        let qno = req.body.qtnno;
        let format = req.body.format;
        let qtnformat = req.body.qtnformat;

        //let qtnno = qno.replaceAll('_', '/');
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo = '${qno}'`);
        // await qtnQueryMod(`Select * from magodqtn.qtnlist where QtnNo='${qno}'`, async (err, qtnidchk) => {
        //     console.log("qtnidchk : " + JSON.stringify(qtnidchk));
        //     if (qtnidchk != null) {
        //         let qtnid = qtnidchk[0].QtnID;
        await qtnQueryMod(`DELETE FROM magodqtn.qtn_itemslist WHERE qtnId='${findQtnID[0].QtnID}`, async (err, qtnid) => { });

        if ((req.body.format == "Laser Cutting") || (req.body.qtnformat == "Sales")) {
            await qtnQueryMod(`SELECT Count(q.Unit_JobWork_Cost) JwcostCount ,Count(q.Unit_Material_cost) UMcostCount FROM magodqtn.qtn_profiledetails q 
                    WHERE (q.Unit_JobWork_Cost=0 or q.Unit_Material_cost=0) AND q.QtnId=' ${findQtnID[0].QtnID}'`, async (err, qtncostchk) => {
                //   console.log(qtncostchk);
                if ((qtncostchk.JwcostCount > 0) || (qtncostchk.UMcostCount > 0)) {
                    res.send({ status: "Success", cntgtr: true });
                }
            })

        }
        else {
            await qtnQueryMod(`Delete from magodqtn.qtn_itemslist where QtnId = '${findQtnID[0].QtnID}'`, async (err, del) => {
                if (err) logger.error(err);
                await qtnQueryMod(`INSERT INTO magodqtn.qtn_itemslist(QtnId, Name, Material, Operation, Quantity, BasePrice)
                            SELECT q.QtnId, q.Dwg_Name,   CONCAT(q.Material,' ', q.MtrlGrade,' ', q.Thickness), q.Operation, q.QtyNested,
                            ROUND(q.Unit_JobWork_Cost+q.Unit_Material_cost) as BasePrice 
                            FROM magodqtn.qtn_profiledetails q WHERE q.QtnId='${findQtnID[0].QtnID}'`, async (err, ins) => {
                    if (err) logger.error(err);
                });
            });

        }
        //  console.log(qtnid);
        res.send({ status: "Success" });
        return;
    } catch (error) {
        next(error)
    }
});

quoteRouter.post('/saveqtnitemslist', async (req, res, next) => {
    try {
        console.log("Import rates");
        console.log(req.body);
        let qno = req.body.qtnno;

        qtnno = qtnno.replaceAll('_', '/');

        qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qtnno + "'", (err, qtnidchk) => {
            console.log("qtnidchk : " + JSON.stringify(qtnidchk));
            if (qtnidchk != null) {
                qtnQueryMod(`Delete from magodqtn.qtn_itemslist where QtnId = '${qtnidchk[0].QtnID}'`, (err, chk) => {
                    if (err) logger.error(err);
                    console.log("Deleted Item - " + qtnidchk[0].QtnID);
                    qtnQueryMod("INSERT INTO magodqtn.qtn_itemslist(QtnId, Name, Material, Operation, Quantity, BasePrice) "
                        + " SELECT q.QtnId, q.Dwg_Name,   CONCAT(q.Material,' ', q.MtrlGrade,' ', q.Thickness), q.Operation, q.QtyNested, "
                        + "ROUND(q.Unit_JobWork_Cost+q.Unit_Material_cost) as BasePrice "
                        + "FROM magodqtn.qtn_profiledetails q WHERE q.QtnId='" + qtnidchk[0].QtnID + "'", (err, ins) => {
                            if (err) logger.error(err);
                        });
                });

                res.send({ status: "Success" });
                return;
            }
        });

    } catch (error) {
        next(error)
    }
});

quoteRouter.post(`/crdeleteqtnitemdata`, async (req, res, next) => {
    // console.log("/////   ********   cr Delete Qtn Item Data...............")
    // console.log(req.body.quotationNo);

    try {
        // if (req.body.item != null) {
        //   console.log("Item Delete btn clicked");
        let qtnno = req.body.quotationNo;
        //         let itemToDel = req.body.item;
        //       console.log(itemToDel.itemname);
        //   qtnno = qtnno.replaceAll('_', '/');

        qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qtnno + "'", (err, qtnidchk) => {
            if (err) logger.error(err);
            //     console.log("qtnidchk : " + JSON.stringify(qtnidchk));
            if (qtnidchk != null) {
                let qtnid = qtnidchk[0].QtnID;
                //       console.log(qtnid);
                //  console.log(itemToDel);
                //  console.log(itemToDel.itemname);
                qtnQueryMod("Delete from magodqtn.qtn_itemslist where QtnId = '" + qtnid + "'", (err, chk) => {
                    if (err) logger.error(err);
                    //  console.log("Deleted Item - " + qtnid + " - " + itemToDel.itemname)
                    res.send({ status: "Deleted" });
                })
            }
        })
        // } else { res.send({ status: "Failed" }) }
    } catch (error) {
        next(error)
    }
});


quoteRouter.post('/deleteqtnitemdata', async (req, res, next) => {
    try {
        if (req.body.item != null) {
            let qtnno = req.body.quotationNo;
            let itemToDel = req.body.item;

            let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo = '${qtnno.replaceAll('_', '/')}'`);

            qtnQueryMod("Delete from magodqtn.qtn_itemslist where QtnId = '" + qtnid + "' and Name='" + itemToDel.itemname + "'", (err, chk) => {
                if (err) logger.error(err);
                res.send({ status: "Deleted" });
            })
        } else { res.send({ status: "Item Delete btn clicked-1 - Failed" }) }
    } catch (error) {
        next(error)
    }
});


quoteRouter.post('/gettaskdetailsdatabyqtn', async (req, res, next) => {
    try {
        console.log("gettaskdetailsdata-1 *************************  Get Task Details Data By QtnNo :");
        let qtnno = req.body.quotationNo;
        console.log(req.body.quotationNo);
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);
        console.log(findQtnID[0].QtnID);
        qtnQueryMod(`Select * from magodqtn.taskdetails where QtnId='${findQtnID[0].QtnID}'`, (err, taskdetlist) => {
            if (err) logger.error(err);
            console.log(taskdetlist);
            res.send(taskdetlist);
        })
    } catch (error) {
        next(error)
    }
});


quoteRouter.post('/gettaskdetailsdatabyqtnid', async (req, res, next) => {
    try {
        console.log("gettaskdetailsdata-1 *************************  Get Task Details Data By QtnNo :");
        let qtnid = req.body.qtnid;
        //  console.log(req.body.quotationNo);
        //  let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);
        // console.log(findQtnID[0].QtnID);
        qtnQueryMod(`Select * from magodqtn.taskdetails where QtnId='${qtnid}'`, (err, taskdetlist) => {
            if (err) logger.error(err);
            console.log(taskdetlist);
            res.send(taskdetlist);
        })
    } catch (error) {
        next(error)
    }
});

quoteRouter.post('/gettaskdetailsdatabyqtnno', async (req, res, next) => {
    try {

        let qtnno = req.body.quotationNo ?? req.body.QtnNo;
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${qtnno}'`);

        qtnQueryMod(`Select * from magodqtn.taskdetails where QtnId='${findQtnID[0].QtnID}'`, (err, taskdetlist) => {
            if (err) logger.error(err);
            //  if (taskdetlist != null) {
            res.send(taskdetlist);
            //   res.send({ status: "Failed" });
            //  }
        })
        // }
        //})
    } catch (error) {
        next(error)
    }
});


// Update Task Details in QtnTaskList
quoteRouter.post('/updtaskgrpdata', async (req, res, next) => {
    try {
        //        console.log("updtaskgrpdata");
        //        console.log(req.body);
        let qtnno = req.body.quotationNo;
        let taskdetlist = req.body.taskdetlist;
        qtnno = qtnno.replaceAll('_', '/');
        //       console.log(qtnno);
        qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qtnno + "'", (err, qtnidchk) => {
            if (err) logger.error(err);
            //          console.log("qtnidchk : " + JSON.stringify(qtnidchk));
            if (qtnidchk != null) {
                let qtnid = qtnidchk[0].QtnID;
                //            console.log(qtnid);
                //            console.log(taskdetlist);
                taskdetlist.forEach((elem, index) => {
                    qtnQueryMod(`UPDATE magodqtn.qtntasklist SET TaskNo = '${(index + 1)}', Operation = '${elem.operation}', Material = '${elem.material}',
                    MtrlGrade = '${elem.mtrlgrade}', Thickness = '${elem.thickness}', Tolerance = '${elem.tolerance}', InspLevel = '${elem.insplevel}',
                    MtrlCode = '${elem.mtrlcode}' WHERE QtnId = '${qtnid}' AND QtnTaskId = '${elem.qtntaskid}'`, (err, inc) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
                res.send({ status: "Success" });
                return;
            }
        });
    } catch (error) {
        next(error)
    }
});


// Get Print Estimation Details - Profile
quoteRouter.post('/getqtnprintestmndets', async (req, res, next) => {
    //    console.log("Get Print Estimation Details - Profile")
    //    console.log(req.body.quotationno);
    try {
        let qtnno = req.body.quotationno;
        qtnQueryMod(`Select * from magodqtn.qtnlist where QtnNo='${qtnno}'`, (err, qtnidchk) => {
            if (err) logger.error(err);

            misQueryMod(`Select * from magodmis.cust_data where Cust_Code= '${qtnidchk[0].Cust_Code}'`, (err, custdata) => {
                if (err) logger.error(err);
                qtnQueryMod(`Select * from magodqtn.qtntasklist where QtnId='${qtnidchk[0].QtnID}'`, (err, qtntsklist) => {
                    if (err) logger.error(err);
                    //  qtnQueryMod(`Select * from magodqtn.qtn_profiledetails where QtnId='${qtnidchk[0].QtnID}' Order by QtnTaskId`, (err, qtnprof) => {
                    qtnQueryMod(`Select * from magodqtn.taskdetails where QtnId='${qtnidchk[0].QtnID}' Order by TaskNo`, (err, qtnprof) => {
                        if (err) logger.error(err);
                        // qtnQueryMod(`SELECT * FROM magodqtn.programmingratelist where current = -1`, (err, prgrmlist) => {
                        qtnQueryMod(`SELECT * FROM magodqtn.programmingratelist p where p.current`, (err, prgrmlist) => {
                            if (err) logger.error(err);
                            setupQuery("SELECT UnitID,UnitName,Unit_Address FROM magod_setup.magodlaser_units where Current = '1'", (unitdata) => {
                                if (err) logger.error(err);
                                //                       console.log(qtntsklist[0]["Task_Mtrl_Weight"])
                                console.log("Get Print Estimation Details - Profile qtnprof length : " + qtnprof.length);
                                res.send({ status: "Success", qtnidchk: qtnidchk, custdata: custdata, qtntsklist: qtntsklist, qtnprof: qtnprof, prglist: prgrmlist, unitdata: unitdata });
                            });
                        });
                    });
                });
            })

        });
    } catch (error) {
        next(error)
    }
});

// Get Print Fabrication Estimation Details

// Get Print Estimation Details - Profile
quoteRouter.post('/getqtnprintfabestmndets', async (req, res, next) => {
    console.log("Get Print Estimation Details - Fab")
    //    console.log(req.body.quotationno);
    try {
        let qtnno = req.body.quotationno;
        qtnQueryMod(`Select * from magodqtn.qtnlist where QtnNo='${qtnno}'`, (err, qtnidchk) => {
            if (err) logger.error(err);
            misQueryMod(`Select BaseId, Name, MaterialCost, LabourCost, (MaterialCost+LabourCost) As Total from magodqtn.fabrication_assyparts 
                        where QtnId = '${qtnidchk[0].QtnID}' And Level=0`, (err, fabassyparts) => {
                if (err) logger.error(err);
                console.log(fabassyparts)
                qtnQueryMod(`Select * from magodqtn.fab_subassy where AssyId = '${fabassyparts[0].BaseId}'`, (err, fabsubassy) => {
                    if (err) logger.error(err);
                    qtnQueryMod(`Select * from magodqtn.fab_bom where AssyId = '${fabassyparts[0].BaseId}'`, (err, fab_bom) => {
                        if (err) logger.error(err);
                        setupQuery("SELECT UnitID,UnitName,Unit_Address FROM magod_setup.magodlaser_units where Current = '1'", (unitdata) => {
                            if (err) logger.error(err);

                            res.send({ status: "Success", qtnidchk: qtnidchk, fabassyparts: fabassyparts, fabsubassy: fabsubassy, fab_bom: fab_bom, unitdata: unitdata });
                        });
                    });
                });
            });
        });
    } catch (error) {
        next(error)
    }
});


// quoteRouter.post(`/updateqtntasklistrates`, async (req, res, next) => {
//     try {
//         const qtnno = req.body.quotationno;
//         const taskgroupdata = req.body.taskgrpData;
//         const taskcuttingcost = req.body.decLengthRate;  // As per Mr. Giridhar and Anil after discussion on 27-Sep-23 4:00 PM
//         const taskpiercecost = req.body.decPierceRate;

//         qtnQueryMod(`Select QtnID from magodqtn.qtnlist where QtnNo = '${qtnno}'`, (err, qtniddata) => {
//             if (err) logger.error(err);
//             for (i = 0; i < taskgroupdata.length; i++) {
//                 qtnQueryMod(`UPDATE magodqtn.qtntasklist set  Task_cuttingRate = '${taskcuttingcost}', Task_PierceRate = '${taskpiercecost}',
//                 Task_Mtrl_Cost = '${taskgroupdata[i].Unit_Material_Cost}', TaskJobWorkCost = '${taskgroupdata[i].Unit_JobWork_Cost}', 
//             where QtnId = '${qtniddata[0].QtnID}'`, (err, data) => {
//                     if (err) logger.error(err);
//                     console.log("Updated Task Details");
//                     res.send({ status: "Success" });
//                 });
//             }
//         });

//     } catch (error) {
//         next(error)
//     }
// });


// get Service Quotation Print Details getqtnprintdetails
quoteRouter.post('/getqtnprintdetails', async (req, res, next) => {
    try {
        console.log("getqtnprintdetails");
        console.log(req.body);
        let qno = req.body.qtnno; //.replaceAll('_', '/');
        //   qtnno = qtnno.replaceAll('_', '/');
        console.log(qno);
        qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qno + "'", (err, qtnidchk) => {
            if (err) logger.error(err);
            qtnQueryMod(`Update magodqtn.qtnlist set QtnStatus = 'Qtn Sent' where QtnNo = '${qno}'`, (err, data) => { if (err) logger.error(err); });
            console.log("qtnidchk : " + JSON.stringify(qtnidchk));
            if (qtnidchk != null) {
                //  console.log(qtnidchk[0].QtnID);
                let qtnid = qtnidchk[0].QtnID;
                console.log(qtnid);

                qtnQueryMod(`Select @a:=@a+1 serial_number,qit.* from magodqtn.qtn_itemslist qit,
                            (SELECT @a:= 0) AS a  where qit.QtnId='${qtnid}'`, (err, qtnitemslist) => {
                    if (err) logger.error(err);
                    console.log("qtnitemslist : " + JSON.stringify(qtnitemslist));
                    //  if (qtnitemslist != null) {
                    qtnQueryMod("Select * from magodqtn.qtntaxes where QtnId='" + qtnid + "'", (err, qtntaxdets) => {
                        if (err) logger.error(err);
                        console.log("qtntaxdets : " + JSON.stringify(qtntaxdets));
                        // if (qtntaxdets != null) {
                        qtnQueryMod("Select * from magodqtn.qtn_termsandconditions where QtnId='" + qtnid + "'", (err, qtntandc) => {
                            if (err) logger.error(err);
                            console.log("qtntandc : " + JSON.stringify(qtntandc));
                            // if (qtntandc != null) {
                            setupQuery("SELECT UnitID,UnitName,Unit_Address FROM magod_setup.magodlaser_units where Current = '1'", (unitdata) => {
                                console.log(unitdata)
                                res.send({ status: "Success", qtnidchk: qtnidchk, qtnitemslist: qtnitemslist, qtntaxdets: qtntaxdets, qtntandc: qtntandc, unitdata: unitdata });
                            });
                            //   res.send({ status: "Success", qtnidchk: qtnidchk, qtnitemslist: qtnitemslist, qtntaxdets: qtntaxdets, qtntandc: qtntandc });
                            // } else {
                            //     res.send({ status: "Failed" });
                            // }
                        })
                    })
                    //} else {
                    //  res.send({ status: "Failed" });
                    // }
                })
            }
        })
    } catch (error) {
        next(error)
    }
});

// Profile Task data save

quoteRouter.post('/saveqtntasklistdets', async (req, res, next) => {
    console.log("saveqtntasklistdets");
    try {
        let { quotationNo, tasklistdata, sQty, tasknetarea, mtrcd, tasknetwt, taskrectarea, cntDwgName, NoOfTasks, taskloc, taskpierces } = req.body;
        //console.log(tasklistdata);        
        if (tasklistdata.length === 0) throw new Error("Task List Data not found");
        let findQtnID = await qtnQueryPromise(`Select QtnID from magodqtn.qtnlist where QtnNo='${quotationNo.replaceAll('_', '/')}'`);

        // await qtnQueryMod(`Delete from magodqtn.qtntasklist where Qtnid = '${findQtnID[0].QtnID}'`, (err, datamsg) => { });

        if (findQtnID.length === 0 || !findQtnID[0].QtnID) throw new Error("Quotation No not found");
        let materialAndGradeMap = Object.keys(tasklistdata).map((g, i) => {
            // console.log(tasklistdata[g][0].material);
            // console.log(tasklistdata[g][0].mtrlcode);
            let material = tasklistdata[g][0].material;
            let grade = tasklistdata[g][0].grade;
            return { groupNo: i + 1, material, grade };
        });

        let materialAndGrade = await misQueryPromise(`Select MtrlGradeID,Specific_Wt, Material, Grade from magodmis.mtrlgrades 
            where Material in ('${materialAndGradeMap.map(m => m.material).join("','")}') and Grade in ('${materialAndGradeMap.map(m => m.grade).join("','")}')`);
        if (materialAndGrade.length === 0) throw new Error("Material and Grade not found");
        // console.log(cntDwgName);
        qtnQueryMod(`Delete from magodqtn.qtntasklist where QtnId = '${findQtnID[0].QtnID}'`, (err, data) => {
            if (err) logger.error(err);
            //      console.log("Deleted Task List Data");
        });

        let qtnTask = await qtnQueryPromise(`INSERT INTO magodqtn.qtntasklist (TaskNo,QtnID, Operation, material, MtrlGrade,MtrlGradeID, Thickness,
            Tolerance, InspLevel,Mtrl_Code,SpWeight,TaskLoc,TaskHoles,TaskNetArea,TaskPartArea,TaskPartRectArea, Task_Net_wt, SumOfQty, TaskParts,
            TaskRectWeight, CountOfDwg_Name,TaskDwgs) VALUES ? ON DUPLICATE KEY UPDATE Operation=VALUES(Operation), material=VALUES(material),
            MtrlGrade=VALUES(MtrlGrade), MtrlGradeID=VALUES(MtrlGradeID), Thickness=VALUES(Thickness), Tolerance=VALUES(Tolerance), InspLevel=VALUES(InspLevel),
            Mtrl_Code=VALUES(Mtrl_Code), SpWeight=VALUES(SpWeight), TaskLoc=VALUES(TaskLoc), TaskHoles=VALUES(TaskHoles),
            TaskNetArea=VALUES(TaskNetArea), TaskPartArea=VALUES(TaskPartArea),TaskPartRectArea=VALUES(TaskPartRectArea),
            Task_Net_wt = VALUES(Task_Net_wt), SumOfQty=VALUES(SumOfQty), TaskParts=VALUES(TaskParts), TaskRectWeight=VALUES(TaskRectWeight),
            CountOfDwg_Name=VALUES(CountOfDwg_Name), TaskDwgs=VALUES(TaskDwgs)`, Object.keys(tasklistdata).map((t, i) => {
            let task = tasklistdata[t][0];
            let materialAndGradeIndex = materialAndGrade.findIndex(m => m.Material === task.material && m.Grade === task.grade);

            let tnetwt = (tasknetarea[t] * materialAndGrade[materialAndGradeIndex].Specific_Wt * task.thickness * 0.0001) * task.quantity;
            let trectwt = (taskrectarea[t] * materialAndGrade[materialAndGradeIndex].Specific_Wt * task.thickness * 0.0001) * task.quantity;
            if (taskloc[t] == null) { taskloc[t] = 0; }
            else { taskloc[t] = taskloc[t]; }
            let taskLoc = taskloc[t];
            //      console.log("Task Loc : " + taskLoc);
            if (taskpierces[t] == null) { taskpierces[t] = 0; }
            else { taskpierces[t] = taskpierces[t]; }
            let taskPierces = taskpierces[t];
            //     console.log("Task Pierces : " + taskPierces);
            return [
                //  materialAndGradeIndex
                // i + 1, findQtnID[0].QtnID, task.operation, task.material, task.grade, materialAndGrade[materialAndGradeIndex].MtrlGradeID,
                // task.thickness, task.tolerance, task.inspectionlevel, task.materialcode, materialAndGrade[materialAndGradeIndex].Specific_Wt,
                // (task.lengthOfCut * task.quantity), (task.noOfPierces * task.quantity), parseFloat(tasknetarea[t]).toFixed(3),
                // parseFloat(taskrectarea[t]).toFixed(3), parseFloat(taskrectarea[t]).toFixed(2), Number(tasknetwt[t]).toFixed(3), sQty[t],
                // cntDwgName[t] ?? 0, Number(task.rectWeight * task.quantity).toFixed(3), cntDwgName[t] ?? 0, cntDwgName[t] ?? 0

                i + 1, findQtnID[0].QtnID, task.operation, task.material, task.grade, materialAndGrade[materialAndGradeIndex].MtrlGradeID,
                task.thickness, task.tolerance, task.inspectionlevel, task.mtrlcode, materialAndGrade[materialAndGradeIndex].Specific_Wt,
                (taskloc[t] > 0 ? parseFloat(taskloc[t]) : taskLoc), (taskpierces[t] > 0 ? parseFloat(taskpierces[t]) : taskPierces),
                parseFloat(tasknetarea[t]).toFixed(3),
                (taskrectarea[t] > 0 ? parseFloat(taskrectarea[t]) : 0).toFixed(3), (taskrectarea[t] > 0 ? parseFloat(taskrectarea[t]) : 0).toFixed(3),
                Number(tnetwt).toFixed(3), sQty[t], cntDwgName[t] ?? 0, Number(trectwt).toFixed(3), cntDwgName[t] ?? 0, cntDwgName[t] ?? 0
            ];

        }));

        // Access the insertId and materialcode
        let insertIds = [];
        let materialcodes = [];
        //  console.log("tasklistdata Inserted Id : " + qtnTask);
        for (let i = 0; i < qtnTask.affectedRows; i++) {
            //  insertIds.push(qtnTask.insertId + i);  // Assuming insertId is incremented for each record
            insertIds.push(qtnTask.insertId + i);
            materialcodes.push(tasklistdata[Object.keys(tasklistdata)[i]][0].materialcode);
        }

        // Update another table using the insertIds and materialcodes
        for (let i = 0; i < insertIds.length; i++) {
            // console.log("Qtn Task Id : "+insertIds[i]);     
            // console.log(findQtnID[0].QtnID);
            // console.log(materialcodes[i]);
            // console.log(tasklistdata[Object.keys(tasklistdata)[i]][0].mtrl_code);
            // console.log(tasklistdata[Object.keys(tasklistdata)[i]][0].operation);       
            // await qtnQueryPromise(`UPDATE magodqtn.qtn_profiledetails SET QtnTaskId='${insertIds[i]}'
            //     WHERE QtnId = '${findQtnID[0].QtnID}' AND mtrl_code = '${materialcodes[i]}' 
            //     AND Operation = '${tasklistdata[Object.keys(tasklistdata)[i]][0].operation}'`);

            await qtnQueryMod(`UPDATE magodqtn.qtn_profiledetails SET QtnTaskId='${insertIds[i]}'
                    WHERE QtnId = '${findQtnID[0].QtnID}' AND mtrl_code = '${tasklistdata[Object.keys(tasklistdata)[i]][0].mtrl_code}' 
                    AND Operation = '${tasklistdata[Object.keys(tasklistdata)[i]][0].operation}'`, async (err, data) => {
                if (err) logger.error(err);
                console.log("Updated Qtn Profile Details");
            });
        }

        await qtnQueryMod(`Delete from magodqtn.taskdetails WHERE QtnId='${findQtnID[0].QtnID}'`, async (err, qtnnos) => {
            if (err) logger.error(err);
        });
        await qtnQueryMod(`SET FOREIGN_KEY_CHECKS=0;`, async (err, sqlmode) => { });
        //     console.log("Insert from taskdetails");
        //  qtnQueryMod(`SET FOREIGN_KEY_CHECKS=0;`, (err, sqlmode) => { });
        // condtion in below select  -  and  qtl.QtnTaskID = q.QtnTaskId 
        await qtnQueryMod(`INSERT INTO magodqtn.taskdetails(ProfileId, QtnTaskId, QtnId,TaskNo, Dwg_Name, Path, Pattern, Operation, mtrl_code, 
                                Material,MtrlGrade,Thickness, Tolerance, Qty, QtyNested, Remarks, DwgExists,InspLevel,LOC,NoofPierces,PartNetArea,PartNetWt,
                                PartOutArea, PartOutWt, Complexity, PartX, PartY, RectWeight, DwgEditingCharge) 
                            SELECT  q.ProfileId, qtl.QtnTaskId,  q.QtnId, qtl.TaskNo,
                            q.Dwg_Name, q.Path, q.Pattern, q.Operation, q.mtrl_code, q.Material,
                            q.MtrlGrade, q.Thickness, q.Tolerance, q.Qty,q.Qty, q.Remarks, q.DwgExists, q.InspLevel, q.LOC, 
                            q.NoofPierces, q.PartNetArea, q.PartNetWt, q.PartOutArea, q.PartOutWt, q.Complexity, q.PartX, 
                            q.PartY, q.RectWeight, q.DwgEditingCharge
                            FROM magodqtn.qtn_profiledetails q, magodqtn.qtntasklist qtl WHERE qtl.QtnID = q.QtnId and
                            qtl.mtrl_code = q.mtrl_code and q.Operation = qtl.Operation and q.QtnId = '${findQtnID[0].QtnID}' `,
            async (err, qtdets) => {
                if (err) logger.error(err);
                console.log("Inserted into taskdetails-after qtn tasklist inserting")
            });
        await qtnQueryMod(`SET FOREIGN_KEY_CHECKS=1;`, async (err, sqlmode) => { });
        // });

        //   console.log(qtnTask);
        res.send({ status: "Success" });
    } catch (error) {
        next(error)
    }
});




quoteRouter.post('/chkQtnItems', async (req, res, next) => {
    try {
        let qtnno = req.body.qtnno;
        let msg = "";
        let qtnrec = "";

        let qnno = qtnno.replaceAll('_', '/');
        qtnQueryMod("Select * from magodqtn.qtnlist where QtnNo='" + qnno + "'", (err, qtnidchk) => {
            if (err) logger.error(err);
            if (qtnidchk != null) {
                let qtnid = qtnidchk[0].QtnID;
                qtnQueryMod(`Select * from magodqtn.qtn_itemslist where QtnId ='${qtnid}'`, (err, data) => {
                    if (err) logger.error(err);
                    console.log(qtnid);
                    res.send(data);
                });
            }
        });

    } catch (error) {
        next(error)
    }
});


module.exports = quoteRouter;