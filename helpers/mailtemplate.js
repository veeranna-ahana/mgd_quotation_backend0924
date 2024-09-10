var moment = require('moment'); // require

const quotationStartPage = async (qtnDetails, unitdata, qtnitems, qtnTC, qtnTaxes, customer) => {
    console.log(qtnTC);
    // console.log(qtnTaxes);
    let TCcontent = `<p><b><u>Terms</u></b></p><ul>`;

    for (let i = 0; i < qtnTC.length; i++) {
        TCcontent += `<li>${qtnTC[i].highlight === 1 ? `<b>${qtnTC[i].Terms}</b>` : qtnTC[i].Terms} </li>`
    }
    TCcontent += `</ul>`
    console.log(TCcontent);

    let CustAddressContent = "";
    CustAddressContent = `${customer[0].Address}`;
    // let CustAddress = customer[0].Address.split(",");
    // for (let i = 0; i < CustAddress.length; i++) {
    //     CustAddressContent += `${CustAddress[i] + (i < CustAddress.length - 1 ? "," : "")}<br/>`
    // }
    return `
    <html>
<style>
    * {
        font-family: Arial, Helvetica, sans-serif;
    }

    body{
        margin: 48px;
    }

    .addr {
        font-size: 12px;
        display: flex;
    }

    .logo-container {
        flex: 1;
        padding: 5px 10px;
    }

    .logo {
        width: 60px;
        height: 60px;
    }

    .addr-container {
        flex: 3;
    }

    .qtn-container {
        flex: 3;
    }

    .details-body {
        font-size: 14px;
        display: block;
    }

    th {
        padding: 2px;
    }
</style>

<body>
    <div style="border: 1px #000000 solid">
        <div class="addr">
            <div class="logo-container">
                <center>
                    <div style="width: 60px; letter-spacing: 0.2rem; text-align: center;"><b>MAGOD</b></div>
                    <img src="data:image/png;base64,Qk0uDAAAAAAAAHYAAAAoAAAASgAAAEsAAAABAAQAAAAAAAAAAADEDgAAxA4AABAAAAAQAAAAAAAA/wAAgP8AgAD/AICA/4AAAP+AAID/gIAA/8DAwP+AgID/AAD//wD/AP8A/////wAA//8A/////wD//////5mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZ//////////mf/////////5n/////////+ZmZmZmZmQAAAJmZmZmZmZn///////mZmZ///////5mZmf//////+ZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZn///////////////////////////////////+ZmZmZmZAAAAmZmZmZ////////////////////////////////////mZmZmZmQAAAJmZmZmf///////////////////////////////////5mZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn//////5mZmZ//////+ZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ///////5mZn///////+ZmZ//////mZmZmZmZmZmQAAAJmZmZmZmZmf///////5mZ//////n/+Zmf/////5mZmZmZmZmZkAAACZmZmZmZmZn/////+f/////////5n/////////+ZmZmZmZmZmZAAAAmZmZmZmZmf//////mf////////mZn////////5mZmZmZmZmZmQAAAJmZmZmZmf///////5mZ//////+ZmZmf//////mZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZn///+ZmZmZmZ////mZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAA=="
                        alt="logo" class="logo" />
                        <div style="width: 60px; letter-spacing: 0.3rem; text-align: center;"><b>LASER</b></div>
                        <div style="max-width:60px; font-size: 10px"><small>ISO9001 : 2008</small></div>
                </center>
            </div>
            <div class="addr-container">
                <h4>Magod Laser Machining Pvt Ltd</h4>
                <p>${unitdata[0].Unit_Address}</p>
            </div>
            <div class="qtn-container">
                <small> F 30 Rev 4</small>
                <h4>${qtnDetails[0].QtnFormat} QUOTATION </h4>
                <p>Quotation No : ${unitdata[0].UnitName} / ${qtnDetails[0].QtnNo} <br />
                    Date : ${moment(qtnDetails[0].QtnDate).format("DD MMMM YYYY")} <br />
                    Valid Upto : ${moment(qtnDetails[0].ValidUpTo).format("DD MMMM YYYY")} </p>
            </div>
        </div>
    </div>
    <div class="details-body">
        <hr />
        <h4>${customer.Cust_name}</h4>
        <p>${CustAddressContent}</p>
        <hr />
        <div>
            Kind Attn : ${qtnDetails[0].Contact} <br />
            Reference : ${qtnDetails[0].EnquiryRef}
        </div>
        <hr />
        <div>
            <ol>
                <li>
                    Thank you very much for your kind enquiry. We are pleased to make the following lowest Quotation as
                    shown below.
                    <div style="display:flex; padding:10px">
                        <div style="flex:1; text-align: center;">
                            <span style="background-color:yellow; font-weight: bold;">@ See Page 2 for Partwise
                                Rates</span>
                        </div>
                    </div>
                    <div>
                        <center>
                            <table style="font-size: 14px;">
                                <thead>
                                    <tr>
                                        <th>Net Value</th>
                                        <th>Tax Name</th>
                                        <th>Tax %</th>
                                        <th>Taxable Amount</th>
                                        <th>Tax Amount</th>
                                        <th>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                ${qtnTaxes.map(tax => {
        return (`
                                        <tr>
                                            <td>${qtnDetails[0].Qtn_Value}</td>
                                            <td>${tax.TaxName}</td>
                                            <td>${tax.TaxPercent}</td>
                                            <td>${tax.TaxableAmount}</td>
                                            <td>${qtnDetails[0].QtnTax}</td>
                                            <td>${qtnDetails[0].QtnTotal}</td>
                                        </tr>
                                    `)
    })}
                                </tbody>
                            </table>
                        </center>
                    </div>
                </li>
                <li>
                    <b><u>Terms & Conditions</u></b>
                    <div>
                        ${TCcontent}
                    </div>
                </li>
            </ol><br/><br/>
            Your's Sincerely<br/><br/><br/><br/>
            ${qtnDetails.PreparedBy}<br/>
            Sales Representative<br/>
            Magod Laser Machining Pvt Ltd
        </div>
    </div>
</body>

</html>
    `
}

const quotationDetails = async (qtnDetails, unitdata, qtnitems) => {
    return (`
    <html>
    <style>
        * {
            font-family: Arial, Helvetica, sans-serif;
        }
    
        body{
            margin: 48px;
        }
    
        .addr {
            font-size: 12px;
            display: flex;
        }
    
        .logo-container {
            flex: 1;
            padding: 5px 10px;
        }
    
        .logo {
            width: 60px;
            height: 60px;
        }
    
        .addr-container {
            flex: 3;
        }
    
        .qtn-container {
            flex: 3;
        }
    
        th {
            border-top: 1px solid;
            border-bottom: 1px solid;
            padding: 10px 2px;
            font-size: 14px;
        }
    
        td {
            padding: 5px 2px;
            font-size: 14px;
        }
    </style>
    
    <body>
        <div style="border: 1px #000000 solid">
            <div class="addr">
                <div class="logo-container">
                    <center>
                        <div style="width: 60px; letter-spacing: 0.2rem; text-align: center;"><b>MAGOD</b></div>
                        <img src="data:image/png;base64,Qk0uDAAAAAAAAHYAAAAoAAAASgAAAEsAAAABAAQAAAAAAAAAAADEDgAAxA4AABAAAAAQAAAAAAAA/wAAgP8AgAD/AICA/4AAAP+AAID/gIAA/8DAwP+AgID/AAD//wD/AP8A/////wAA//8A/////wD//////5mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZ//////////mf/////////5n/////////+ZmZmZmZmQAAAJmZmZmZmZn///////mZmZ///////5mZmf//////+ZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZn///////////////////////////////////+ZmZmZmZAAAAmZmZmZ////////////////////////////////////mZmZmZmQAAAJmZmZmf///////////////////////////////////5mZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn//////5mZmZ//////+ZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ///////5mZn///////+ZmZ//////mZmZmZmZmZmQAAAJmZmZmZmZmf///////5mZ//////n/+Zmf/////5mZmZmZmZmZkAAACZmZmZmZmZn/////+f/////////5n/////////+ZmZmZmZmZmZAAAAmZmZmZmZmf//////mf////////mZn////////5mZmZmZmZmZmQAAAJmZmZmZmf///////5mZ//////+ZmZmf//////mZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZn///+ZmZmZmZ////mZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAA=="
                            alt="logo" class="logo" />
                            <div style="width: 60px; letter-spacing: 0.3rem; text-align: center;"><b>LASER</b></div>
                            <div style="max-width:60px; font-size: 10px"><small>ISO9001 : 2008</small></div>
                    </center>
                </div>
                <div class="addr-container">
                    <h4>Magod Laser Machining Pvt Ltd</h4>
                    <p>${unitdata[0].Unit_Address}</p>
                </div>
                <div class="qtn-container">
                <small> F 30 Rev 4</small>
                <h4>${qtnDetails[0].QtnFormat} QUOTATION </h4>
                <p>Quotation No : ${unitdata[0].UnitName} / ${qtnDetails[0].QtnNo} <br />
                    Date : ${moment(qtnDetails[0].QtnDate).format("DD MMMM YYYY")} <br />
                    Valid Upto : ${moment(qtnDetails[0].ValidUpTo).format("DD MMMM YYYY")} </p>
            </div>
            </div>
        </div>
        <p><b>Quotation Details : Appendix</b></p>
        <table style="width: 100%;">
            <thead>
                <tr class="thead">
                    <th>Srl No</th>
                    <th>Item Name / Job Descrption</th>
                    <th>Operation</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Amount</th>
                </tr>
    
            </thead>
            <tbody>
                <tr>
                    ${qtnitems.map((item, index) => {
        return `<tr>
                                    <td>${index + 1}</td>
                                    <td>${item.Name}</td>
                                    <td>${item.Operation}</td>
                                    <td align="right">${item.Quantity}</td>
                                    <td align="right">${item.BasePrice}</td>
                                    <td align="right">${(item.Quantity * (item.BasePrice - item.DiscountAmount))}</td>
                                </tr>`
    })}
            </tbody>
        </table>
    </body>
    
    </html>
    `)
}

// // Due Report
const dueReportStartPage = async (custdata, duesdata, duedata) => {

    const custname = custdata.custname;
    const date = new Date();
    let currdate = moment(date).format("DD/MM/YYYY");

    return `
    <html>
<style>
    * {
        font-family: Arial, Helvetica, sans-serif;
    }

    body {
        margin: 48px;
    }

    .addr {
        font-size: 12px;
        display: flex;
    }

    .logo-container {
        flex: 1;
        padding: 5px 10px;
    }

    .logo {
        width: 60px;
        height: 60px;
    }

    .addr-container {
        flex: 3;
    }

    .qtn-container {
        flex: 3;
    }

    .details-body {
        font-size: 14px;
        display: block;
    }

    table,
    th,
    td {
        border: 1px solid black;
    }
</style>

<body>
    <div>
        <div class="addr">
            <div class="logo-container">
                <center>
                    <div style="width: 60px; letter-spacing: 0.2rem; text-align: center;"><b>MAGOD</b></div>
                    <img src="data:image/png;base64,Qk0uDAAAAAAAAHYAAAAoAAAASgAAAEsAAAABAAQAAAAAAAAAAADEDgAAxA4AABAAAAAQAAAAAAAA/wAAgP8AgAD/AICA/4AAAP+AAID/gIAA/8DAwP+AgID/AAD//wD/AP8A/////wAA//8A/////wD//////5mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZ//////////mf/////////5n/////////+ZmZmZmZmQAAAJmZmZmZmZn///////mZmZ///////5mZmf//////+ZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZn///////////////////////////////////+ZmZmZmZAAAAmZmZmZ////////////////////////////////////mZmZmZmQAAAJmZmZmf///////////////////////////////////5mZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn//////5mZmZ//////+ZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ///////5mZn///////+ZmZ//////mZmZmZmZmZmQAAAJmZmZmZmZmf///////5mZ//////n/+Zmf/////5mZmZmZmZmZkAAACZmZmZmZmZn/////+f/////////5n/////////+ZmZmZmZmZmZAAAAmZmZmZmZmf//////mf////////mZn////////5mZmZmZmZmZmQAAAJmZmZmZmf///////5mZ//////+ZmZmf//////mZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZn///+ZmZmZmZ////mZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAA=="
                        alt="logo" class="logo" />
                    <div style="width: 60px; letter-spacing: 0.3rem; text-align: center;"><b>LASER</b></div>
                </center>
            </div>
            <div class="addr-container">
                <h4>Magod Laser Machining Pvt Ltd</h4>
                <p>Jigani </p>
            </div>
            <div class="qtn-container">
                <p>Plot No 72, Phase II KIADB Industrial,<br />
                    Area Jigani, Anekal Taluk,<br />
                    Bangalore - 560 105<br />
                    KARNATAKA</p>
            </div>
        </div>
        <div>
            <center>
                <div>
                    <h4>List of Invoices Due for Payment as ${currdate} </h4> 
                </div>

        </div>
        </center>
    </div>
    </div>
    <div class="details-body">
        <hr />
        <h4>Customer Name : ${custdata[0].Cust_name}</h4>
        <h4>Due Amount : ${duesdata[0].overDue}</h4>
        <hr />
        <div style="display:flex; padding:10px">
            <table style="flex:1;max-width:fit-content; border:1px">
                <thead>
                    <tr>
                        <th style="padding:0px 10px 0px 0px">Srl</th>
                        <th style="padding:0px 20px 0px 20px">Inv No</th>
                        <th style="padding:0px 20px 0px 20px">Inv Date</th>
                        <th style="padding:0px 20px 0px 20px">Amount</th>
                        <th style="padding:0px 20px 0px 20px">Received</th>
                        <th style="padding:0px 20px 0px 20px">Balance</th>
                        <th style="padding:0px 20px 0px 20px">Due Date</th>
                        <th style="padding:0px 20px 0px 20px">Over Due days</th>
                        
                    </tr>
                </thead>

            <tbody>
            ${duedata.map((item, index) => {
        return ` 
                        <tr style="height:40px">
                            <th colspan="7">PO NO : ${item.PO_No}</th>
                            <th colspan="2">Due Amount : ${(item.GrandTotal - item.PymtAmtRecd).toFixed(2)}</th>
                        </tr>

                    <tr style = "height:30px">
                        <th style="padding:0px 10px 0px 0px">${index + 1}</th>
                        <th style="padding:0px 20px 0px 20px">${item.Inv_No}</th>
                        <th style="padding:0px 20px 0px 20px">${item.Inv_Date}</th>
                        <th style="padding:0px 20px 0px 20px">${item.GrandTotal}</th>
                        <th style="padding:0px 20px 0px 20px">${item.PymtAmtRecd}</th>
                        <th style="padding:0px 20px 0px 20px">${(item.GrandTotal - item.PymtAmtRecd).toFixed(2)}</th>
                        <th style="padding:0px 20px 0px 20px">${moment(item.PaymentDate).format("DD/MM/YYYY")}</th>
                        <th style="padding:0px 20px 0px 20px">${item.DueDays}</th>

                    </tr>`
    })}
                </tbody>
            </table>
        </div>
    <hr />
    </div>
</body>
</html>
    `
}

const estimationPage = async (qtnDetails, qtnprofile) => {
    return (`
    <html>
<style>
    * {
        font-family: Arial, Helvetica, sans-serif;
    }

    body{
        margin: 48px;
    }

    .addr {
        font-size: 14px;
        display: flex;
    }

    .logo-container {
        flex: 1;
        padding: 5px 10px;
    }

    .logo {
        width: 60px;
        height: 60px;
    }

    .addr-container {
        flex: 5;
    }

    .qtn-container {
        flex: 3;
    }

    .details-body {
        font-size: 14px;
        display: block;
    }

    th {
        padding: 2px;
    }
</style>

<body>
    <div>
        <div class="addr">
            <div class="logo-container">
                <center>
                    <div style="width: 60px; letter-spacing: 0.2rem; text-align: center;"><b>MAGOD</b></div>
                    <img src="data:image/png;base64,Qk0uDAAAAAAAAHYAAAAoAAAASgAAAEsAAAABAAQAAAAAAAAAAADEDgAAxA4AABAAAAAQAAAAAAAA/wAAgP8AgAD/AICA/4AAAP+AAID/gIAA/8DAwP+AgID/AAD//wD/AP8A/////wAA//8A/////wD//////5mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZ//////////mf/////////5n/////////+ZmZmZmZmQAAAJmZmZmZmZn///////mZmZ///////5mZmf//////+ZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZn///////////////////////////////////+ZmZmZmZAAAAmZmZmZ////////////////////////////////////mZmZmZmQAAAJmZmZmf///////////////////////////////////5mZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn/////+ZmZmZ//////mZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ//////mZmZmf/////5mZmZn/////+ZmZmZmZmZmQAAAJmZmZmZmZmf/////5mZmZn/////+ZmZmZ//////mZmZmZmZmZkAAACZmZmZmZmZn//////5mZmZ//////+ZmZmf/////5mZmZmZmZmZAAAAmZmZmZmZmZ///////5mZn///////+ZmZ//////mZmZmZmZmZmQAAAJmZmZmZmZmf///////5mZ//////n/+Zmf/////5mZmZmZmZmZkAAACZmZmZmZmZn/////+f/////////5n/////////+ZmZmZmZmZmZAAAAmZmZmZmZmf//////mf////////mZn////////5mZmZmZmZmZmQAAAJmZmZmZmf///////5mZ//////+ZmZmf//////mZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZn///+ZmZmZmZ////mZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAJmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZkAAACZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZAAAAmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmQAAAA=="
                        alt="logo" class="logo" />
                        <div style="width: 60px; letter-spacing: 0.3rem; text-align: center;"><b>LASER</b></div>
                        <div style="max-width:60px; font-size: 10px"><small>ISO9001 : 2008</small></div>
                </center>
            </div>
			<small> F 29 Rev 4</small>
            <div class="addr-container">
                <h3>Magod Laser Machining Pvt Ltd : ${unitdata[0].UnitName}</h3>
              <h4> QUOTATION ESTIMATION FORM</h4>
            </div>
            <div class="qtn-container">
                <p>Type : JobWork <br />
					Qtn No : ${qtnDetails[0].QtnNo} <br />
                    Status : Created</p>
            </div>
			
        </div>
		<hr />
		<div class="addr">
			<div class="addr-container">
			 <p>Customer Name : ${customer.Cust_name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
				Enquiry Ref   : ${qtnDetails[0].EnquiryRef}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br />
				Enquiry Date  : ${qtnDetails[0].EnquiryDate}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
			</div>
			 <div class="qtn-container">
				<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Contact   : ${qtnDetails[0].Contact} <br />
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Telephone : ${qtnDetails[0].custtele}</p>
			</div>
		</div>
    </div>
	<hr />
    <div class="details-body">
       <p><b><u>Task No : ${qtntsklist[0].TaskNo} &nbsp;&nbsp;&nbsp;   ${qtntsklist[0].Operation} / ${qtntsklist[0].InspLevel} / ${qtntsklist[0].Tolarance}</u></b><br />
			 <b>${qtntsklist[0].material} / ${qtntsklist[0].MtrlGradeID} / ${qtntsklist[0].Thickness} mm / ${qtntsklist[0].mtrl_code}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Cutting Charges : ${qtnprof[0].Cutting_Charge}
			 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Rate/Mtr : 000.00 <br /></p>
			 <div class="addr">
			<div class="addr-container">
				<div style="border: 1px #000000 solid; width:600px;font-size:13px">
				 <p>&nbsp;&nbsp;&nbsp;LOC / Pierces &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  : ${qtntsklist[0].TaskLOC} / ${qtntsklist[0].TaskHoles} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				 Cutting / Pierce Rate &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  :  ${qtntsklist[0].Task_Basic_Cutting_Cost} / 1}<br />
				   &nbsp;&nbsp;&nbsp;Drawings/ Nested :  ${qtntsklist[0].CountOfDwg_Name} / ${qtntsklist[0].TaskDwgs}  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				   Setup/Sheet Loading Rate &nbsp;&nbsp;: &nbsp;&nbsp;&nbsp;&nbsp;100 / 10<br />
				   &nbsp;&nbsp;&nbsp;Parts/ Nested  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :  &nbsp;&nbsp;3/ 30  
				   &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
				    &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Material Handling/Kg &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; &nbsp;&nbsp;1.5<br />
					&nbsp;&nbsp;&nbsp;Nests/ Sheets &nbsp;&nbsp;&nbsp; : 1/ 1   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Material Rate/Kg 
				   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : &nbsp;&nbsp; &nbsp;&nbsp; 0 <br />
				   &nbsp;&nbsp;&nbsp;Net / Rect / Nested Weight  : 93.64 / 143.27 / 146.8</p>
				   </p>
				</div>
				</div>
				<div class="qtn-container" style="font-size:13px">
					<p>&nbsp;&nbsp;Programming &nbsp;&nbsp;&nbsp;: 999.00&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Rate / Kg  : 999999.99<br />
					&nbsp;&nbsp;SetUp and SheetHandling &nbsp;&nbsp;&nbsp;:  110.00<br />
					&nbsp;&nbsp;Material Handling &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:  220.00<br />
					&nbsp;&nbsp;Base Rate Job Work &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 3,653.20  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>JobWork &nbsp;&nbsp;   : 3653.20</b><br />
					&nbsp;&nbsp;Base Rate Material &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 3,653.20  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Material &nbsp;&nbsp;   : 3653.20</b><br /></p>
				</div>
			
			</div>
	<div>
	<hr />
	<div>
	<table>
	<thead>
	<tr style="font-size:13px">
			<td style="width:500px">
				&nbsp;Drawing Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Qty&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Nested&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				LOC&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:120px">
				Pierce&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:120px">
				CF&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Dwgs&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Perimeter&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				JW Cost&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Mtrl Cost&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Total&nbsp;
			</td>
		</tr>
		
		</thead>
		<hr />	
		<tbody>
		${qtnProfileData.map(qtnprofile => {
        return (`
		   <tr>
		   <td>${qtnprofile.Dwg_Name}</td>
		   <td style="width:80px">
				${qtnprofile.Qty}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				${qtnprofile.QtyNested}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				${qtnprofile.LOC}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:120px">
				${qtnprofile.NoofPierces}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:120px">
				${qtnprofile.Complexity}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				${qtnprofile.DwgExists}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Perimeter&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				${qtnprofile.OutOpen}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				${qtnprofile.Unit_JobWork_Cost}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				${qtnprofile.Unit_Material_Cost}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			</td>
			<td style="width:80px">
				Total&nbsp;
			</td>
		   </tr>
		   	<hr />	
		   `)
    })}
		</tbody>
		</table>
	</div>
	<hr />	
   
    </div>
</body>

</html>
   `)
};

module.exports = { quotationStartPage, quotationDetails, dueReportStartPage, estimationPage };