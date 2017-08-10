var express = require('express'),
    router = express.Router();

var async = require('async'),
    fs = require('fs'),
    path = require('path');

var xml2js = require('xml2js'),
    config = require('../config');
    
var fork = require('child_process').fork;

var dbService = require('../modules/dbService');

var bots = [];

router.get('/', (req, res) => {
  res.render('index', { error: req.flash('error'), success: req.flash('success'), bots: bots});
}); 

router.post('/add-ids', (req, res) => {
  var groupId = req.body.group,
      ids = req.files.ids;

  if (ids.mimetype !== 'text/plain') {
    req.flash('error', 'Некорректный формат файла.');
    return res.redirect('/');
  }

  ids.mv(path.join(__dirname, `../docs/${ids.name}`), (err) => {
    if (err) {
      req.flash('error', 'Ошибка при загрузке файла. ' + err);
      return res.redirect('/');
    }

    fs.readFile(path.join(__dirname, `../docs/${ids.name}`), 'utf8', function(err, contents) {
        if (err) {
          req.flash('error', 'Ошибка при чтении файла. ' + err);          
          return res.redirect('/');
        }

        var steamids = contents.match(/[^\r\n]+/g);
        if (steamids && steamids.length > 0) {
          dbService.initDbRecords(steamids,groupId,(err)=>{
            if (err) {
              req.flash('error', `Steam IDs не были добавлены: ${err.message}.`);
            } else {
              req.flash('success', 'Steam IDs были успешно добавлены.');
            }
            return res.redirect('/');
          });
        }                        
    });
  });
});

router.post('/add-bots', (req, res) => {
  var botc = req.files.bots;

  if (botc.mimetype !== 'text/xml') {
    req.flash('error', 'Некорректный формат файла с ботами.');
    return res.redirect('/');
  }

  botc.mv(path.join(__dirname, `../docs/${botc.name}`), (err) => {
    if (err) {
      req.flash('error', 'Ошибка при загрузке файла с ботами. ' + err);
      return res.redirect('/');
    }

    fs.readFile(path.join(__dirname, `../docs/${botc.name}`), 'utf8', function(err, contents) {
        if (err) {
          req.flash('error', 'Ошибка при чтении файла с ботами. ' + err);
          return res.redirect('/');
        }

        var parser = new xml2js.Parser({explicitArray : false});
        parser.parseString(contents, (err, data)=>{
          
          if (err) return callback(new Error(`Не удалось преобразовать xml в js-объект. \n    Причина:${err.message}`));
          
          var paramsList = [];
          if (Array.isArray(data["bots"]["bot"]))
            paramsList = data["bots"]["bot"]
          else
            paramsList.push(data["bots"]["bot"]);
          
          for (var i = 0; i < paramsList.length; i++) {
            var params = paramsList[i];
            var paramsArray =
             [`--login=${params.login}`,
              `--password=${params.password}`,
              `--groupId=${params.groupId}`,
              `--chat_config=${params.chatConfig}`,
              `--repeat_invitation_timeout=${params.repeat_invitation_timeout}`,
              `--online_action_timeout=${params.online_action_timeout}`,
              `--handle_new_user_timeout=${params.handle_new_user_timeout}`,
              `--thanksgiving_timeout=${params.thanksgiving_timeout}`,
              `--dbHost=${config.get('dbHost')}`,
              `--dbUser=${config.get('dbUser')}`,
              `--dbPassword=${config.get('dbPassword')}`,
              `--dbDatabase=${config.get('dbDatabase')}`];
            
            var isFound = false;
            for (var j = 0; j < bots.length; j++) {
              if (bots[j].account == params.login){
                isFound = true;
                break;
              };
            }
            if (isFound) continue;
            
            var dir = path.join(__dirname, '../../stmb-unit/app.js');
            var child = fork(dir, paramsArray,{"execArgv":[]});
            
            bots.push({
              id: child.pid,
              account: params.login,
              email: params.email,
              status: 0,
              process: child
            });
          }
        });
        
        req.flash('success', 'Боты успешно проинициализированы.');
        res.redirect('/');
    });
  });
});

router.post('/steam-guard-auth', (req, res) => {
  var id = req.body.id,
      code = req.body.code,
      done = false;
    
  if (!code) {
    req.flash('error', `Был передан пустой код.`);
    return res.redirect('/');
  }

  for (var i = 0; i < bots.length; i++) {
    if (bots[i].id == id) {
      bots[i].status = 1;
      bots[i].process.send({
        "code": code,
        "type":"auth"
      });
      req.flash('success', `Боту ${bots[i].account} передан код.`);
      done = true;
    }
  }
  if (!done)
    req.flash('error', `Бот ${bots[i].account} не был запущен. Проверьте корректность кода.`);
  res.redirect('/');
});

router.post('/steam-guard-two-factor', (req, res) => {
  var id = req.body.id,
      code = req.body.code,
      done = false;
    
  if (!code) {
    req.flash('error', `Был передан пустой код.`);
    return res.redirect('/');
  }

  for (var i = 0; i < bots.length; i++) {
    if (bots[i].id == id) {
      bots[i].status = 1;
      bots[i].process.send({
        "code": code,
        "type":"two-factor"
      });
      req.flash('success', `Боту ${bots[i].account} передан код.`);
      done = true;
    }
  }
  if (!done)
    req.flash('error', `Бот ${bots[i].account} не был запущен. Проверьте корректность кода.`);
  res.redirect('/');
});

router.post('/kill', (req, res) => {
  var id = req.body.id,
      done = false;
  for (var i = 0; i < bots.length; i++) {
    if (bots[i].id == id) {
      bots[i].process.kill();
      bots.splice(i, 1);      
      req.flash('success', `Процесс #${id} был успешно завершен.`);
      done = true;
    }
  }
  if (!done)
    req.flash('error', `Произошла ошибка при завершении процесса #${id}.`);
  res.redirect('/');
});

module.exports = router;
