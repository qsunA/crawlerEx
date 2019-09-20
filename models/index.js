const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.BookInfo = require('./bookInfo')(sequelize, Sequelize);
db.BookAladin = require('./bookAladin')(sequelize, Sequelize);
db.BookKb = require('./bookKb')(sequelize, Sequelize);
db.BookYes = require('./bookYes')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;