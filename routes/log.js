var express = require('express'),
    router = express.Router();

var async = require('async');
var dbService = require('../modules/dbService');

var mysql_query_count = (query, cb) => {
  var results = [];
  results.push({
    numRows: 100
  })
  cb(results);
}

var mysql_query_data = (query, cb) => {
  var results = [];
  for (var i = 0; i < 15; i++) {
    results.push({
      code: 1,
      date: '25-25-25',
      message: 'awjfoifjowajfwa',
      account: 'botname'
    });
  }
  cb(results);
}

router.get('/', (req, res) => {
  var where = "";
  var numRows, numPages;
  var numPerPage = parseInt(req.query.npp, 10) || 15;
  var page = parseInt(req.query.p, 10) || 0;
  var skip = page * numPerPage;
  
  var limit = skip + ',' + skip + numPerPage;

  if (req.query.code) {
    if (where) where += ' AND ';
    where += `status LIKE '%${req.query.code}%'`;
  }
  if (req.query.account) {
    if (where) where += ' AND ';
    where += `botAccountName LIKE '%${req.query.account}%'`;
  }
  if (req.query.message) {
    if (where) where += ' AND ';
    where += `message LIKE '%${req.query.message}%'`;
  }
     
  async.series({
    numPages: (cb) => {
      var query = 'SELECT count(*) as numRows FROM log';
      if (where) query += ' WHERE ' + where;
      dbService.query(query, (err, results) => {        
        numRows = results[0].numRows;
        numPages = Math.ceil(numRows / numPerPage);
        cb(null, numPages); 
      });
    },
    payload: (cb) => {
      var queryStart = 'SELECT * FROM log '
      var queryEnd = ' ORDER BY timestamp DESC LIMIT ' + limit;
      if (where) queryStart += ' WHERE ' + where;
      dbService.query(queryStart + queryEnd, (err, results) => {
        var responsePayload = {
          results: results
        };

        responsePayload.pagination = {
          current: page,
          perPage: numPerPage,
          previous: page > 0 ? page - 1 : undefined,
          next: page < numPages - 1 ? page + 1 : undefined,
          last: numPages
        }

        cb(null, responsePayload);
      });
    }
  }, (err, results) => {
    var filter = {
      code: req.query.code,
      account: req.query.account,
      message: req.query.message
    }
    res.render('log', { filter: filter, logs: results.payload.results, pagination: results.payload.pagination });
  });
});

module.exports = router;