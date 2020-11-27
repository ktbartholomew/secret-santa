var MongoClient = require('mongodb').MongoClient;
var Q = require('q');
var util = require('util');
var log = require('../log');

var connection;

var connect = function() {
  return Q.Promise(function(resolve, reject) {
    if (connection) {
      return resolve(connection);
    }

    MongoClient.connect(util.format(
      'mongodb://%s:%s@%s:%s/%s',
      process.env.MONGO_USER,
      process.env.MONGO_PASS,
      process.env.MONGO_HOST,
      process.env.MONGO_PORT,
      process.env.MONGO_DB
    ), function (err, db) {
        if (err) {
          return reject(err);
        }

        connection = db;
        return resolve(connection);
      }
    );
  });
};

var insert = function(document) {
  connect().then(function(db) {
    var collection = db.collection('games');

    return Q.ninvoke(collection, 'insert', document);
  });
};

var find = function(query) {
  return connect()
    .then(function(db) {
      var collection = db.collection('games');
      return Q.ninvoke(collection, 'find', query);
    })
    .then(function(cursor) {
      return Q.ninvoke(cursor, 'toArray');
    });
};

var findOne = function(query) {
  return find(query).then(function(results) {
    return Q.resolve(results[0]);
  });
};

var update = function(query, data) {
  return connect().then(function(db) {
    var collection = db.collection('games');
    return Q.ninvoke(collection, 'update', query, data);
  });
};

module.exports = {
  insert: insert,
  find: find,
  findOne: findOne,
  update: update
};
