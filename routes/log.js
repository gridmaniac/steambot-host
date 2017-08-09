var express = require('express'),
    router = express.Router();

var async = require('async');

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
  var numRows, numPages, where;
  var numPerPage = parseInt(req.query.npp, 10) || 15;
  var page = parseInt(req.query.p, 10) || 1;
  var skip = page * numPerPage;
  
  var limit = skip + ',' + skip + numPerPage;

  if (req.query.code) {
    if (where) where += ' AND ';
    where += `code LIKE '%${req.query.code}%'`;
  }
  if (req.query.account) {
    if (where) where += ' AND ';
    where += `account LIKE '%${req.query.account}%'`;
  }
  if (req.query.message) {
    if (where) where += ' AND ';
    where += `message LIKE '%${req.query.message}%'`;
  }
   
  async.series({
    numPages: (cb) => {
      var query = 'SELECT count(*) as numRows FROM tbl_log';
      if (where) query += ' WHERE ' + where;
      mysql_query_count(query, (results) => {
        numRows = results[0].numRows;
        numPages = Math.ceil(numRows / numPerPage);
        cb(null, numPages);
      });
    },
    payload: (cb) => {
      var query = 'SELECT * FROM tbl_log ORDER BY DATE DESC LIMIT ' + limit;
      if (where) query += ' WHERE ' + where;
      mysql_query_data(query, (results) => {
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