var express = require('express'),
    router = express.Router();

var async = require('async'),
    fs = require('fs'),
    path = require('path');

var xml2js = require('xml2js'), 
    config = require('../config');

var cron = require('node-cron');
var dbService = require('../modules/dbService');
var LogStatus = require('../modules/logStatus');

var request = require('request');

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: config.get("dbHost"),
    user: config.get("dbUser"),
    password: config.get("dbPassword"),
    database: config.get("dbDatabase")
});

var groups = "";
var tasks = [];

router.get('/', (req, res) => {
  res.render('check', { error: req.flash('error'), success: req.flash('success'), groups: groups});  
}); 

router.post('/update-groups', (req, res) => {
  
  groups = req.body.groups;
  if (!groups) {
    req.flash('error',`Нет групп для проверки`);
    return res.redirect('/check');
  }
  var groupObjects = groups.match(/[^\r\n]+/g);
  
  for (var j = 0; j < tasks.length; j++) {
    tasks[j].destroy();
  }

  for (var i = 0; i < groupObjects.length; i++) {
    var groupObject = groupObjects[i];
    let groupName = groupObject.split(':')[0];
    let groupId = groupObject.split(':')[1];
    let cronTimer = groupObject.split(':')[2];

    updateMembershipStates(groupName, groupId);
    var task = cron.schedule(cronTimer, function() {
      updateMembershipStates(groupName, groupId);
    }, false);

    tasks.push(task);
    task.start();
  }

  req.flash('success','Список групп успешно обновлен');
  res.redirect('/check');
});

function updateMembershipStates(groupName, groupId){
    
  async.series({
      freshList: function(callback) {
        getMembers(groupName, groupId, (err,ids)=>{
          return callback(err, ids);
        });
      },
      dbList: function(callback) {
        getNotInGroupSteamIds(groupId,(err,steamIds)=>{
          return callback(err, steamIds);
        });    
      }
  }, function(err, results) {
    if (err) {
      dbService.log(LogStatus.ERR,`Произошла ошибка при проверке факта вступления пользователей в группу.\n    Причина: ${err.message}`);
    }
    var freshList = results.freshList;    
    var dbList = results.dbList;
    for (var i = 0; i < dbList.length; i++) {
      var steamId = dbList[i];
      if (freshList.indexOf(steamId) > -1){
        dbService.log(LogStatus.LOG,`Пользователь ${steamId} вступил в группу ${groupId}`);
        markAsMember(steamId, groupId);
      }
    }
  });
}

function markAsMember(steamId, groupId, callback){
  // Проверить является ли callback функцией
  callback = typeof callback === 'function' ? callback : function(){};

  connection.query(`
    UPDATE
      users
    SET
      groupState = 1,
      sendThanksState = 1
    WHERE
      steamId = "${steamId}"
      AND
      groupId = "${groupId}"`,
    (err, results, fields)=>{
      if (err) return callback(err);
      if (results.affectedRows == 0) return callback(new Error(`Не удалось отметить Пользователя ${steamId} как члена группы ${groupId}.\n    Причина: ${err.message}`));
      return callback(null, results);
    }
  );
}

function getNotInGroupSteamIds(groupId, callback){
  // Проверить является ли callback функцией
  callback = typeof callback === 'function' ? callback : function(){};

  connection.query(`
    SELECT
      steamId
    FROM
      users
    WHERE            
      groupId = "${groupId}"
      AND
      groupState = 0`,
    (err, results, fields)=>{
      if (err) return callback(err);
      
      if (results.length == 0)
        return callback(null, []);

      var steamIds = [];
      for (var i = 0; i < results.length; i++) {
        steamIds.push(results[i]["steamId"]);
      }
      
      return callback(null, steamIds);
    }
  );
}

function getMembers (groupName, groupId, callback){
  dbService.log(LogStatus.LOG, `Попытка получения списка пользователей группы ${groupName}...`);
  var parser = new xml2js.Parser();
  // TODO Rewrite callback hell to async
  request({
      url: encodeURI(`http://steamcommunity.com/groups/${groupName}/memberslistxml?xml=1`)
    },
    function(err, response, body) {
      if (err) return callback(err);
      if (response.statusCode != 200) {
        return callback(new Error(`Удаленный ресурс отклонил запрос`));
      }
      parser.parseString(body, function(err, result) {
        if (err) return callback(new Error(`Возникла ошибка при парсинге xml ${err.message}`));

        var totalPages = result.memberList.totalPages[0];
        var IDs = [];
        async.timesSeries(totalPages, function(n, next) {
          setTimeout(() => {
            var pageNumber = n + 1;                        
            //console.log('Page:'+pageNumber);

            request({
              url: `http://steamcommunity.com/groups/${groupName}/memberslistxml?xml=1&p=${pageNumber}`
            },
            function(err, response, body) {              
              if (err) return next(err);
              if (response.statusCode != 200) {
                return next(new Error(`Удаленный ресурс отклонил запрос`));
              }

              parser.parseString(body, function(err, result) {                
                if (err) return next(new Error(`Возникла ошибка при парсинге xml ${err.message}`));
                var chunkLength = result.memberList.members[0].steamID64.length;
                var membersListChunk = result.memberList.members[0].steamID64;
                
                for (var i = 0;i < chunkLength; i++) {                  
                  IDs.push(membersListChunk[i]);
                }

                return next(null);                
              });
            });
          }, 5000);          
        },
        function(err, info) {          
          if (err) {            
            return callback(new Error(`Произошла ошибка при скачивании списка пользователей`));
          }  
          return callback(null, IDs);
        });
      });
    }
  );
}

module.exports = router;