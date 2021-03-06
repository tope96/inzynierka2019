/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('status_wniosku', {
    IdStatusWniosku: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    Nazwa: {
      type: DataTypes.STRING(25),
      allowNull: true
    }
  }, {
    tableName: 'status_wniosku',
    timestamps: false
  });
};
