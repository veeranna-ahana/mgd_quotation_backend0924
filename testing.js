// const { misQuery, qtnQuery, setupQuery } = require('./helpers/dbconn');

//const { sendQuotation } = require('./helpers/sendmail');
const {checkdrawings} = require('./helpers/folderhelper');

checkdrawings('2022_09_023',(ins) => {console.log(ins)})

// setupQuery("SELECT *  FROM magod_setup.magod_runningno WHERE SrlType='Quotation' And UnitName='Dabaspet' ORDER BY Id DESC LIMIT 1;", (data) => {
//     console.log(data["Running_No"]);
// })

// let mon = ["January", "Febraury", "March", "April", "May", "June", "July", "August"]

// console.log(mon[new Date().getMonth()]);

// console.log(new Date().getMonth().toString().padStart(3,'0'));
// let runningno = 6

// console.log(new Date().getFullYear().toString() + "_" + (new Date().getMonth() + 1).toString() +'_'+ (parseInt(runningno) + 1).toString().padStart(3,'0'))

// console.log(new Date(Date.now()).toLocaleString('en-US', {month: 'long'}));
// //******************************


// const Drawing = require('dxf-writer');
// const fs = require('fs');

// let d = new Drawing();

// d.setUnits('Decimeters');
// d.drawText(10, 0, 10, 0, 'Hello World'); // draw text in the default layer named "0"
// d.addLayer('l_green', Drawing.ACI.GREEN, 'CONTINUOUS');
// d.setActiveLayer('l_green');
// d.drawText(20, -70, 10, 0, 'go green!');

// //or fluent
// d.addLayer('l_yellow', Drawing.ACI.YELLOW, 'DOTTED')
//  .setActiveLayer('l_yellow')
//  .drawCircle(50, -30, 25);

// fs.writeFileSync(__filename + '.dxf', d.toDxfString());


// misQuery("Select * from magodmis.cust_data", (custdata) => {
//     custdata.forEach(cust => {
//         console.log(cust["Cust_name"]);
//     });

// })

// console.log(process.env.MAGOD_ACCESS);

let customer = {
    name: "Pranav",
    address: "No 105, 19th Cross, 11 Main Road, Bangalore - 560080",
    contact: "Pranav M S"
}
let qtnDetails = {
    format: "JOB WORK",
    unitName: "Jigani",
    qtnNo: "2022/09/07",
    qtnDate: "2022-09-07T23:03:00+05:30",
    validUpto: "2022-09-07T23:03:00+05:30",
    enquiryRef: "123465",
    netValue: "1234.56",
    taxes: "123.45",
    total: "1358.01",
    taxDetails: [
        {
            taxName: "GST",
            taxableAmt: "1234.56",
            taxPercent: "18",
            taxAmt: "123.45"
        },
        {
            taxName: "CGST",
            taxableAmt: "1234.56",
            taxPercent: "18",
            taxAmt: "123.45"
        }
    ],
    preparedBy: "ABCD",
    items: [
        {
            itemName: "50 X 150 MM WELDER Aluminium Basic 1.1",
            operation: "Laser Cutting",
            qty: "1",
            unitPrice: "1234.56",
            total: "1234.56",
        }
    ]
}

let qtnTC = {
    Rates: ["All Rates ex-factory", "Rates are for quantity mentioned, subject to change if order quantity is different"],
    Taxes: ["All Taxes as applicable at time of dispatch"],
    Note: ["Scope of work with material lazer cutting"]
}

// sendQuotation(customer, qtnDetails, qtnTC, (err, data) => {
//     if(err) console.log(err);
//     else console.log(data);
// });