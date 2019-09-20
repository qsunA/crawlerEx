module.exports=(sequelize,DataTypes) => {
    const BookKb = sequelize.define('BookKb', {
        discountPrice : {
            type: DataTypes.Number(),
            allowNull: false
        },
        point : {
            type : DataTypes.Number(),
        }
    },{
        charset:'utf8',
        collate:'utf8_general_ci',
    });

    BookKb.associate = (db) => {
        db.BookKb.belongsTo(db.BookInfo);
    };

    return BookKb;
}