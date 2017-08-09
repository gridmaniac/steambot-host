var express = require('express'),
    router = express.Router();

var async = require('async'),
    fs = require('fs'),
    path = require('path');

var bots = [];
bots.push({
  id: 253,
  account: 'botname',
  email: 'test@yandex.ru',
  status: 1
});
bots.push({
  id: 254,
  account: 'botname2',
  email: 'test2@yandex.ru',
  status: 0
});
bots.push({
  id: 255,
  account: 'botname3',
  email: 'test3@yandex.ru',
  status: 0
});

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
          //добавление в БД
        }
        
        req.flash('success', 'Steam IDs были успешно добавлены.');
        res.redirect('/');
        contents
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

        //обрабатываем файл с ботами
        //тестовое добавление бота
        bots.push({
          id: 258,
          account: 'botname4',
          email: 'test4@yandex.ru',
          status: 0
        });
        
        req.flash('success', 'Боты успешно проинициализированы.');
        res.redirect('/');
    });
  });
});

router.post('/steam-guard', (req, res) => {
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
      req.flash('success', `Бот ${bots[i].account} начал работу.`);
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
