const { DataTypes } = require("sequelize");

// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = sequelize => {
  // defino el modelo
  sequelize.define(
    "country",
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
          isAlpha: {
            msg: "Id must be a three-letter code string"
          }
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      flagImg: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: {
            msg: "FlagImg must be an URL string"
          }
        },
        defaultValue: "../assets/default_country_flag.jpg"
      },
      continent: {
        type: DataTypes.STRING,
        allowNull: false
      },
      capital: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subregion: {
        type: DataTypes.STRING
      },
      area: {
        type: DataTypes.INTEGER
      },
      population: {
        type: DataTypes.INTEGER,
        validate: {
          isNumeric: true
        }
      }
    },
    {
      timestamps: false
    }
  );
};
