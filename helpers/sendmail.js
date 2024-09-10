const nodemailer = require("nodemailer");
var html_to_pdf = require('html-pdf-node');
const { merge } = require('merge-pdf-buffers');

const { quotationStartPage, quotationDetails, dueReportStartPage } = require('./mailtemplate');

const genPdf = (content, callback) => {
    html_to_pdf.generatePdf({ content }, {
        format: 'A4', margin: {
            right: 20, left: 20, top: 20, bottom: 20
        }
    }).then(pdfBuffer => {
        callback(pdfBuffer);
    });
}

const sendQuotation = async (qtnDetails, unitdata,  qtnTC, customer, qtnitems, qtnTaxes, callback) => {
    console.log(qtnDetails);
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'magodlaser3@gmail.com',
            pass: 'xdivlvhikoafaoqj'
        }
    });
    let emailcontent = await quotationStartPage(qtnDetails, unitdata,  qtnTC, customer, qtnitems, qtnTaxes, );
    let emailcontent2 = await quotationDetails(qtnDetails, unitdata, qtnitems, customer);
    let emailTextContent = `
        Dear Sir,<br/><br/>

        Reference No: ${qtnDetails[0].EnquiryRef}<br/><br/>

        We are pleased to offer our Lowest Quotation of Rs/- ${qtnDetails[0].QtnTotal} for the same.<br/>
        Details are as given in the attachment.<br/><br/>

        Looking forward to your placing an early order. We offer you the best of service in Quality and Timely Delivery.<br/><br/>
        With Warm Regards<br/><br/>

        Yours Sincerely<br/><br/>

        ${qtnDetails[0].PreparedBy}<br/>

        Magod Laser Machining Pvt Ltd : ${unitdata[0].UnitName}<br/>
    `
    genPdf(emailcontent, async (pdfBuffer) => {
        genPdf(emailcontent2, async (pdfBuffer2) => {
            const merged = await merge([pdfBuffer, pdfBuffer2]);
            let info = await transporter.sendMail({
                from: 'magodlaser3@gmail.com', // sender address
                to: "suresh.mapp@gmail.com", // list of receivers
                subject: "Quotation", // Subject line
                text: emailTextContent.replaceAll("<br/>", "\n"), // plain text body
                html: emailTextContent, // html body
                attachments: [
                    {
                        filename: 'quotation_'+qtnDetails[0].QtnNo.replaceAll('/','_')+'.pdf',
                    //    filename: 'quotation.pdf',
                        content: new Buffer(merged, 'utf-8'),
                    }
                ]
            });
            if (info.messageId) {
                callback(null, info.messageId);
            } else {
                callback('Error in sending mail', null);
            }
        });
    });

}


const sendEstimation = async (qtnDetails, unitdata, qtnprofile, callback) => {
    console.log(qtnDetails);
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'magodlaser3@gmail.com',
            pass: 'xdivlvhikoafaoqj'
        }
    });
    let emailcontent = await estimationPage(qtnDetails, unitdata, qtnitems, qtnTC, qtnTaxes, customer);
       let emailTextContent = `
        Dear Sir,<br/><br/>
        Reference No: ${qtnDetails[0].EnquiryRef}<br/><br/>
        We are pleased to offer our Lowest Quotation of Rs/- ${qtnDetails[0].QtnTotal} for the same<br/>
        Details are as given in the attachment.<br/><br/>
        Looking forward to your placing an early order. We offer you the best of service in Quality and Timely Delivery.<br/><br/>
        With Warm Regards<br/><br/>
        Yours Sincerely<br/><br/>
        ${qtnDetails[0].PreparedBy}<br/>
        Magod Laser Machining Pvt Ltd : ${unitdata[0].UnitName}<br/>
    `
    genPdf(emailcontent, async (pdfBuffer) => {
        genPdf(emailcontent2, async (pdfBuffer2) => {
            const merged = await merge([pdfBuffer, pdfBuffer2]);
            let info = await transporter.sendMail({
                from: 'magodlaser3@gmail.com', // sender address
                to: "suresh.mapp@gmail.com", // list of receivers
                subject: "Estimation", // Subject line
                text: emailTextContent.replaceAll("<br/>", "\n"), // plain text body
                html: emailTextContent, // html body
                attachments: [
                    {
                        filename: 'estimation_'+qtnDetails[0].QtnNo.replaceAll('/','_')+'.pdf',
                        content: new Buffer(merged, 'utf-8'),
                    }
                ]
            });
            if (info.messageId) {
                callback(null, info.messageId);
            } else {
                callback('Error in sending mail', null);
            }
        });
    });

}



const sendDueList = async (customer, duesdata, duedata, callback) => {
    console.log("Send Due List")
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'magodlaser3@gmail.com',
            pass: 'xdivlvhikoafaoqj'
        }
    });
    let emailcontent = await dueReportStartPage(customer, duesdata, duedata);

    let emailTextContent = `
        Dear Sir,<br/><br/>
    
        We would like to bring it to your notice that outstandings due of Rs/- ${duesdata[0].overDue} 
        from your side<br/>
        Details are as given in the attachment.<br/><br/>
        Looking forward for your earlier response towards clearing the dues. <br/><br/>
        With Warm Regards<br/><br/>
        Yours Sincerely<br/><br/><br/>
       
        Magod Laser Machining Pvt Ltd : Jigani Unit<br/>
    `
    genPdf(emailcontent, async (pdfBuffer) => {
        //  genPdf(emailcontent2, async (pdfBuffer2) => {
        // const merged = await merge([pdfBuffer, pdfBuffer2]);
        let info = await transporter.sendMail({
            from: '"Magod Laser" <magodlaser3@gmail.com>', // sender address
            to: "suresh.mapp@gmail.com", // list of receivers
            subject: `List of Invoices Due for Payment as on ${Date()}`, // Subject line
            text: emailTextContent.replaceAll("<br/>", "\n"), // plain text body
            html: emailTextContent, // html body
            attachments: [
                {
                    filename: 'DueList.pdf',
                    content: pdfBuffer,
                }
            ]
        });
        if (info.messageId) {
            callback(null, info.messageId);
        } else {
            callback('Error in sending mail', null);
        }
        // });
    });

}

const sendAttachmails = async (to, cc, mailsubject, mailbody, file, callback) => {
    console.log(mailsubject);
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'magodlaser3@gmail.com',
            pass: 'nisxnacwozjtuplp'
        }
    });
    let info = await transporter.sendMail({
        from: '"Magod Laser" <magodlaser3@gmail.com>', // sender address
        to: to, // list of receivers
        cc: cc,
        subject: mailsubject, // Subject line
        text: mailbody,
        html: mailbody.replaceAll("\n", "<br/>"), // plain text body
        attachments: [file]
    });
    if (info.messageId) {
        callback(null, info.messageId);
    } else {
        callback('Error in sending mail', null);
    }
};

module.exports = { sendQuotation, sendDueList, sendAttachmails };

// Account : pranav13100@gmail.com
// Password : lgukawauauccnihf