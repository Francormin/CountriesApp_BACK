const { Router } = require("express");
const { Country, Activity } = require("../db");
const fetch = require("node-fetch");
const { Op } = require("sequelize");
const { handleNotFound, handleBadRequest } = require("../utils");

const router = Router();

router.get("/", async (req, res, next) => {
  const { name } = req.query;

  try {
    if (name) {
      const countriesDb = await Country.findAll();

      if (countriesDb.length) {
        const countriesWithNameDb = await Country.findAll({
          where: {
            name: {
              [Op.iLike]: `%${name}%`
            }
          }
        });

        if (countriesWithNameDb.length) {
          const countriesWithNameDbArray = countriesWithNameDb.map(country => country.dataValues);

          const countriesWithNameInfo = countriesWithNameDbArray.map(country => {
            return {
              flagImg: country.flagImg,
              name: country.name,
              id: country.id,
              continent: country.continent,
              capital: country.capital,
              subregion: country.subregion,
              area: country.area,
              population: country.population
            };
          });

          return res.status(200).json(countriesWithNameInfo);
        } else {
          return res.status(404).json(handleNotFound("There is no country with that name"));
        }
      } else {
        const countriesWithNameApi = await fetch(`https://restcountries.com/v3/name/${name}`)
          .then(response => response.json())
          .then(data => data)
          .catch(error => new Error("countriesApiNameError: ", error));

        if (countriesWithNameApi.length) {
          const countriesWithNameInfo = countriesWithNameApi.map(country => {
            return {
              flagImg: country.flags[0],
              name: country.name.common,
              id: country.cioc ? country.cioc : country.cca3,
              continent: country.region,
              capital: country.capital ? country.capital[0] : "no capital",
              subregion: country.subregion ? country.subregion : country.continents[0],
              area: country.area,
              population: country.population
            };
          });

          return res.status(200).json(countriesWithNameInfo);
        } else {
          return res.status(404).json(handleNotFound("There is no country with that name"));
        }
      }
    } else {
      const countriesDb = await Country.findAll();

      if (!countriesDb.length) {
        const countriesApi = await fetch("https://restcountries.com/v3/all")
          .then(response => response.json())
          .then(data => data)
          .catch(error => new Error("countriesApiError: ", error));

        if (countriesApi.length) {
          for (const countryApi of countriesApi) {
            const [,] = await Country.findOrCreate({
              where: {
                id: countryApi.cioc ? countryApi.cioc : countryApi.cca3,
                name: countryApi.name.common,
                flagImg: countryApi.flags[0],
                continent: countryApi.region,
                capital: countryApi.capital ? countryApi.capital[0] : "no capital",
                subregion: countryApi.subregion ? countryApi.subregion : countryApi.continents[0],
                area: countryApi.area,
                population: countryApi.population
              }
            });
          }

          const countriesInfoToShow = countriesApi.map(country => ({
            id: country.cioc ? country.cioc : country.cca3,
            name: country.name.common,
            flagImg: country.flags[0],
            continent: country.region,
            capital: country.capital ? country.capital[0] : "no capital",
            subregion: country.subregion ? country.subregion : country.continents[0],
            area: country.area,
            population: country.population
          }));

          return res.status(200).json(countriesInfoToShow);
        } else {
          return res.status(400).json(handleBadRequest("There was a problem with the REST API"));
        }
      } else {
        const countriesInfoToShow = await Country.findAll({
          include: {
            model: Activity,
            through: {
              attributes: []
            }
          }
        });

        return res.status(200).json(countriesInfoToShow);
      }
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:idCountry", async (req, res, next) => {
  const { idCountry } = req.params;

  try {
    if (!isNaN(parseInt(idCountry)))
      return res.status(400).json(handleBadRequest("The ID param must be a three-letter code string"));

    const countriesDb = await Country.findAll();

    if (countriesDb.length) {
      const countryIdWithActivities = await Country.findByPk(idCountry.toUpperCase(), {
        include: {
          model: Activity,
          through: {
            attributes: []
          }
        }
      });

      countryIdWithActivities
        ? res.status(200).json(countryIdWithActivities.dataValues)
        : res.status(404).json(handleNotFound("There is no country with that id"));
    } else {
      const countryWithId = await fetch(`https://restcountries.com/v3/alpha/${idCountry}`)
        .then(response => response.json())
        .then(data => data)
        .catch(error => new Error("countryWithThatIdError: ", error));

      if (countryWithId.length) {
        const countryInfoToShow = countryWithId.map(country => {
          return {
            flagImg: country.flags[0],
            name: country.name.common,
            id: country.cioc ? country.cioc : country.cca3,
            continent: country.region,
            capital: country.capital ? country.capital[0] : "no capital",
            subregion: country.subregion ? country.subregion : country.continents[0],
            area: country.area,
            population: country.population
          };
        });

        return res.status(200).json(countryInfoToShow[0]);
      } else {
        return res.status(404).json(handleNotFound("There is no country with that id"));
      }
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
