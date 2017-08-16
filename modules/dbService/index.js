var config = require('../../config');
    async = require('async'),
    mysql = require('mysql');

var connection = mysql.createConnection({
    host: config.get("dbHost"),
    user: config.get("dbUser"),
    password: config.get("dbPassword"),
    database: config.get("dbDatabase")
});

module.exports = {
  initDbRecords: (steamIds, groupId, callback)=>{
    // Проверить является ли callback функцией
    callback = typeof callback === 'function' ? callback : function(){};

    if (!groupId){
      return callback(new Error("Ошибка при попытке добавления записей. Не передан groupId"));
    }
    if (steamIds.length == 0) {
      return callback(new Error("Ошибка при попытке добавления записей. Нет steamId для инициализации"));
    }
    
    async.eachSeries(steamIds, (steamId, next) => {
      connection.query(`
        SELECT count(*)
        FROM users
        WHERE
          steamId = "${steamId}"
          AND
          groupId = "${groupId}"
      `, (err, results)=>{
        if (err) return next(new Error(`"Ошибка при попытке добавления записи Пользователя ${steamId}\n    Причина: ${err.message}`));
        if (results[0]['count(*)'] != 0) {
          return next();
        }

        connection.query(`
          INSERT INTO
            users(
              steamId,
              groupId,
              friendState,
              chatState,
              groupState,
              botAccountName,
              lastInvitationDate,
              sendThanksState,
              giftState)
          VALUES
            (
              "${steamId}",
              "${groupId}",
              0,
              0,
              0,
              null,
              null,
              0,
              0)`,
          (err, results)=>{
            if (err) return next(new Error(`"Ошибка при попытке добавления записи Пользователя ${steamId}\n    Причина: ${err.message}`));
            return next();
          }
        );
      });
    },(err)=>{
      if (err) return callback(err);
      return callback(null);
    });
  },
  log: (status, message)=>{
    connection.query(`
      INSERT INTO
        log
          (status,
            timestamp,
            botAccountName,
            message)
      VALUES
          ("${status}",
            NOW(),
            "HOST",
            "${message}")`,(err, results)=>{      
        //ничего не делать...callback-и от log-ов не нужны
      }
    );
  },
  query: (query, callback)=>{
    // Проверить является ли callback функцией
    callback = typeof callback === 'function' ? callback : function(){};

    connection.query(query,
      (err, results, fields)=>{
        if (err) return callback(err);        
        return callback(null, results);
      }
    );
  }
}