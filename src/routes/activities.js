const { Router } = require("express");
const { Activity, Country } = require("../db");
const { Op } = require("sequelize");
const { handleCreated, handleBadRequest } = require("../utils");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const activitiesDb = await Activity.findAll({
      order: [["name", "asc"]]
    });

    if (activitiesDb.length) return res.status(200).json(activitiesDb);
    else
      return res
        .status(404)
        .json(handleBadRequest("There are no activities to show. You must do the POST activities first"));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { name, difficulty, duration, season, countriesById } = req.body;

  try {
    if (!name || typeof name !== "string") return res.status(400).json(handleBadRequest("The name must be a string"));

    if (!difficulty || typeof difficulty !== "number" || difficulty < 1 || difficulty > 5)
      return res.status(400).json(handleBadRequest("The difficulty must be a number between 1 and 5"));

    if (!duration || typeof duration !== "number" || duration < 1 || duration > 24)
      return res.status(400).json(handleBadRequest("The duration must be a number between 1 and 24"));

    if (
      !season ||
      (season.toLowerCase() !== "spring" &&
        season.toLowerCase() !== "autumn" &&
        season.toLowerCase() !== "winter" &&
        season.toLowerCase() !== "summer")
    )
      return res.status(400).json(handleBadRequest("The season must be 'spring', 'autumn', 'winter' or 'summer'"));

    if (!countriesById || !Array.isArray(countriesById))
      return res.status(400).json(handleBadRequest("CountriesById must be an array of elements"));

    const [newActivity, created] = await Activity.findOrCreate({
      where: {
        name: name.toLowerCase(),
        difficulty: difficulty
      },
      defaults: {
        name: name.toLowerCase(),
        difficulty,
        duration,
        season: season.toLowerCase()
      }
    });

    // for (const countryId of countriesById) {
    //   const countryFound = await Country.findByPk(countryId.toUpperCase());

    //   if (!countryFound) continue;

    //   await CountryActivity.create({
    //     activityId: newActivity.id,
    //     countryId: countryId.toUpperCase(),
    //   });
    // }

    const countriesWithIdDb = await Country.findAll({
      where: {
        id: {
          [Op.in]: countriesById.map(countryId => countryId.toUpperCase())
        }
      }
    });

    const countriesInfoDb = countriesWithIdDb.map(country => country.dataValues);

    await newActivity.addCountries(countriesInfoDb.map(country => country.id));

    if (created) return res.status(201).json(handleCreated("The activity has been created successfully", newActivity));
    else
      return res
        .status(201)
        .json(handleCreated("There is already an activity with that name and that difficulty", newActivity));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
