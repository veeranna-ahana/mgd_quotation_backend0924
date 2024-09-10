var mysql = require("mysql2");

var misConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kimbu403",
  database: "magodmis",
});

var setupConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kimbu403",
  database: "magod_setup",
});

var qtnConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kimbu403",
  database: "magodqtn",
});

var mchConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kimbu403",
  database: "machine_data",
});

var slsConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kimbu403",
  database: "magod_sales",
});

var mtrlConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kimbu403",
  database: "magod_mtrl",
});

const initializeConnections = () => {
  misConn.connect();
  setupConn.connect();
  qtnConn.connect();
  mchConn.connect();
  slsConn.connect();
  mtrlConn.connect();
}

let misQuery = async (q, callback) => {
  misConn.query(q, (err, res, fields) => {
    if (err) throw err;
    callback(res);
  });
};

let misQueryMod = async (q, callback) => {
  misConn.query(q, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

let misQueryPromise = (q) => {
  return new Promise((resolve, reject) => {
    misConn.query(q, (err, res, fields) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

let mtrlQueryMod = async (m, callback) => {
  mtrlConn.query(m, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

let setupQuery = (q, callback) => {
  setupConn.query(q, (err, res, fields) => {
    if (err) throw err;
    callback(res);
  });
};

let setupQueryMod = async (q, callback) => {
  setupConn.query(q, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

let qtnQuery = (q, callback) => {
  qtnConn.query(q, (err, res, fields) => {
    if (err) throw err;
    callback(res);
    // return res[0].solution;
  });
};

let qtnQueryMod = (q, callback) => {
  qtnConn.query(q, (err, res, fields) => {
    if (err) {
      console.log(q);
      callback(err, null);
      return;
    }
    if(res.length == 0){
      console.log(q);
    }
    callback(null, res);
    // return res[0].solution;
  });
};

let qtnQueryModv2 = (q, values, callback) => {
  qtnConn.query(q, values, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
    // return res[0].solution;
  });
};

let qtnQueryPromise = (q, values = []) => {
  return new Promise((resolve, reject) => {
    console.log(values);
    qtnConn.query(q, [values], (err, res, fields) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

let slsQueryMod = (s, callback) => {  
  slsConn.query(s, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

let mchQueryMod = (m, callback) => {
  mchConn.query(m, (err, res, fields) => {
    if (err) callback(err, null);
    else callback(null, res);
  });
};

module.exports = {
  initializeConnections,
  misQuery,
  setupQuery,
  qtnQuery,
  misQueryMod,
  misQueryPromise,
  qtnQueryMod,
  qtnQueryModv2,
  qtnQueryPromise,
  slsQueryMod,
  mchQueryMod,
  mtrlQueryMod,
  setupQueryMod,
};
