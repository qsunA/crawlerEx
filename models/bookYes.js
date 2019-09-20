module.exports=(sequelize,DataTypes) => {
    const BookYes = sequelize.define('BookYes', {
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

    BookYes.associate = (db) => {
        db.BookYes.belongsTo(db.BookInfo);
    };

    return BookYes;
}