const { DataTypes } = require("sequelize");

// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = sequelize => {
  // defino el modelo
  sequelize.define(
    "activity",
    {
      name: {
        type: DataTypes.STRING
      },
      difficulty: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: {
            msg: "Difficulty must be an integer number between 1 and 5"
          },
          min: 1,
          max: 5
        }
      },
      duration: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: {
            msg: "Duration must be an integer number between 1 and 24"
          },
          min: 1,
          max: 24
        }
      },
      season: {
        type: DataTypes.ENUM("spring", "autumn", "winter", "summer"),
        validate: {
          isIn: {
            args: [["spring", "autumn", "winter", "summer"]],
            msg: "Season must be 'Spring', 'Autumn', 'Winter' or 'Summer'"
          }
        }
      }
    },
    {
      timestamps: false
    }
  );
};
