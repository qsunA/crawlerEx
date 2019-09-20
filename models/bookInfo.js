module.exports = (sequelize,DataTypes) => {
    const BookInfo = sequelize.define('BookInfo',{
        isbn : {
            type:DataTypes.STRING(200),
            allowNull:false,
            unique : true
        },
        img : {
            type : DataTypes.STRING(200),            
        },
        title : {
            type : DataTypes.STRING(500),
            allowNull : false
        },
        subtitle : {
            type : DataTypes.TEXT(),
        },
        author : {
            type : DataTypes.STRING(500),
        },
        price : {
            type : DataTypes.NUMBER()
        }
    },{
        charset:'utf8',
        collate:'utf8_general_ci',
    });

    return BookInfo;
}