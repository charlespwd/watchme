#!/bin/env node
const _ = require('lodash');
const throttle = _.throttle;
const debounce = _.debounce;
const chokidar = require('chokidar');
const fs = require('fs');
const SQL = require('sql.js');
const cli = require('commander');
const path = require('path');
const moment = require('moment');

function getDb(saveFileName) {
  let db;

  try {
    const filebuffer = fs.readFileSync(saveFileName);
    db = new SQL.Database(filebuffer);
  } catch (e) {
    db = new SQL.Database();
    setupDb(db);
  }

  return db
}

function save(db, saveFileName) {
  const data = db.export();
  const buffer = new Buffer(data);
  fs.writeFileSync(saveFileName, buffer);
}

function setupDb(db) {
  db.run('CREATE TABLE saveCount (timestamp int, filename char, day text);');
}

cli.arguments('<glob> [savefile]')
  .action(function main(glob, savefile) {
    const saveFileName = savefile || 'counts.sqlite';
    const db = getDb(saveFileName);
    const requestSave = debounce(() => save(db, saveFileName), 5000);
    const absoluteGlob = path.join(process.cwd(), glob)
    const countEvent = throttle((path) => {
      const now = moment();
      const statement = `INSERT INTO saveCount VALUES (${now.format('X')}, '${path}', '${now.format('YYYY-MM-DD')}');`;
      db.run(statement);
      console.log(statement);
      requestSave();
    }, 1000);

    const watcher = chokidar.watch(absoluteGlob, {
      ignored: /(^|[\/\\])\../,
      ignoreInitial: true,
    });
    watcher.on('add', countEvent);
    watcher.on('change', countEvent);
  })
  .parse(process.argv);
