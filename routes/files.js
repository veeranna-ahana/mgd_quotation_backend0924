const fileRouter = require("express").Router();
var createError = require('http-errors')
const fs = require('fs');
var find = require('list-files');

const multer = require("multer");
const { copyfile } = require("../helpers/folderhelper");
const CustomStorageEngine = require("../helpers/storageEngine");
const { misQueryMod } = require("../helpers/dbconn");

const basefolder = 'C:\\Magod\\Jigani';

var storage = new CustomStorageEngine({
    destination: function (req, file, cb) {
        console.log(req.headers['destinationpath']);
        console.log(basefolder + req.headers['destinationpath']);
        cb(null, basefolder + req.headers['destinationpath'])
    }
})

const upload = multer({ storage: storage });

fileRouter.post('/uploaddxf', upload.array("files"), function (req, res, next) {
    res.send({ status: 'success' });
});


// fileRouter.post('/uploaddxf', upload.array("files"), function (req, res, next) {
//     console.log("Upload Dxf files")
//     console.log(req.files);
//     try {
//         if (req.files != null) {
//             console.log(req.files[0].filename);

//             res.json({ message: "File uploaded successfully", files: req.files });

//         } else {
//             res.json({ message: "File not Uploaded .." });
//         }
//     } catch (error) {
//         console.log(error);
//         next(error)
//     }
// });

// Local Copying of DXF files
fileRouter.post('/copydxf', async (req, res, next) => {
    console.log(" Copy Dxf ")
    try {
        let filename = req.body.drwfname;
        let destination = req.body.destPath;
        console.log(req.body.drwfname);
        console.log(basefolder + destination);
        copyfile(filename, basefolder + destination + '\\' + filename, (err, result) => {
            if (err) {
                res.status(500).send(err);
                console.log(err);
            } else {
                res.send({ status: 'success' });
            }
        });
    } catch (error) {
        console.log(error)
        next(error)
    }
})

fileRouter.post('/getdxf', async (req, res, next) => {
    try {
        const { dxfname } = req.body;
        //  const { frompath } = req.body.frompath;
        //       console.log(dxfname);
        let content = fs.readFileSync("uploads/" + dxfname);
        //    let content = fs.readFileSync(basefolder + "\\" + frompath+"\\" + dxfname);
        res.send(content);
    } catch (error) {
        console.log(error);
        next(error)
    }
});

fileRouter.post('/getorddxf', async (req, res, next) => {
    try {
        const { dxfname } = req.body;
        console.log(req.body);
        //  const { frompath } = req.body.frompath;
        //    console.log(dxfname);
        let basefolder = process.env.ORDFILE_FOLDER;
        basefolder = basefolder + req.body.docno + "\\DXF\\";

        let content = fs.readFileSync(basefolder + dxfname + ".dxf");

        //    let content = fs.readFileSync(basefolder + "\\" + frompath+"\\" + dxfname);
        res.send(content);
    } catch (error) {
        console.log(error);
        next(error)
    }
});

fileRouter.post('/getcustprsfiles', async (req, res,next) => {
    console.log("getcustprsfiles");
    try {
// console.log(req.body.docNo);
//         let custcode = "";
//         await misQueryMod(`SELECT Cust_Code from magodmis.order_list Where Order_No = '${req.body.docNo}'`, async (err,data) => {
//             if (err) console.log(err);

//             console.log(data);
//             custcode = data[0].Cust_Code;
//         })
        let path = basefolder + req.body.despath;
        console.log(path)
        let data = fs.readdirSync(path, { withFileTypes: true })
        .filter(item => !item.isDirectory())
       // .map(item => item.name)
        // .forEach(item => {
        //     console.log(item);
        // });
        console.log(data);
        res.send(data);

        // const custcode = req.body.ccode;
        // let filepath = basefolder + "\\CustDwg\\" + custcode + "\\Parts\\";
        // //  const path = basefolder + req.body.filepath + "\\" + quoteno;
        // let content = fs.readdirSync(filepath);
        // res.send({ files: content })
    } catch (error) {
        console.log(error);
       next(error);
    }
});

fileRouter.post('/getdxfnames', async (req, res) => {
    try {
        // console.log(req);
        //const quoteno = req.body.quoteno;
        let filepath = req.body.filepath.replace("/", "_");
        const path = basefolder + req.body.filepath;
        let content = fs.readdirSync(path);
        res.send({ files: content })
    } catch (error) {
        console.log(error);
        //       next(error);
    }
});

//Files from Quotation folder

fileRouter.post('/getdxffilenames', async (req, res) => {
    try {
        // console.log(req);
        const quoteno = req.body.quoteno.replace("/", "_");
        let filepath = req.body.filepath; //.replace("/","_");
        const path = basefolder + req.body.filepath + "\\" + quoteno;
        let content = fs.readdirSync(path);
        res.send({ files: content })
    } catch (error) {
        console.log(error);
        //       next(error);
    }
});

fileRouter.post('/getfolderfilenames', async (req, res) => {
    try {
        // console.log(req);
        //  docNo, destPath 

       // const quoteno = req.body.docno.replace("/", "_");
      
      //  let filepath = req.body.destPath; //.replace("/","_");
        let path = basefolder + req.body.destPath;
        // let content = fs.readdirSync(path);
        //  var find = require('list-files');
console.log(path);
        // find(function (result) {
        //    console.log(result);
        //     res.send({ result })
        // }, {
        //     dir: path, //'DXF',
        //     name: 'dxf'
        // });


        //  New Code

        // let destPath = `\\Wo\\` + schNo + "\\DXF\\";
        // let path = basefolder + destPath;

       // fs.readdirSync('./dirpath', { withFileTypes: true })
        let data = fs.readdirSync(path, { withFileTypes: true })
            .filter(item => !item.isDirectory())
           // .map(item => item.name)
            // .forEach(item => {
            //     console.log(item);
            // });
            console.log(data);
            res.send(data);

    } catch (error) {
        console.log(error);
        //       next(error);
    }
});

module.exports = fileRouter;