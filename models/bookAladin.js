module.exports=(sequelize,DataTypes) => {
    const BookAladin = sequelize.define('BookAladin', {
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

    BookAladin.associate = (db) => {
        db.BookAladin.belongsTo(db.BookInfo);
    };

    return BookAladin;
}