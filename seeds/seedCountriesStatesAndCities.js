require("dotenv").config();
const mongoose = require("mongoose");
const Country = require("../models/country");
const State = require("../models/state");
const City = require("../models/city");
const {
  toCapitalize,
  generateCountryCode,
  generateStateCode,
  generateCityCode,
} = require("../utils/helpers");
const { data } = require("./countriesStatesCities");

const DB_URL = process?.env?.DB_URL ?? "";
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const getAllValues = (countries) => {
  const allStates = [];
  const allCities = [];

  const allCountries = countries
    ?.map((country) => {
      const { name, iso3, iso2, states } = country;
      const countryCode = generateCountryCode();

      const mappedStates = states
        ?.filter((state) => state?.state_code?.trim()?.length > 0)
        ?.map((state) => {
          const { name: stateName, state_code, cities } = state;
          const stateCode = generateStateCode();

          const mappedCities = cities
            ?.filter((city) => city?.name?.trim()?.length > 0)
            ?.map((city) => {
              const cityCode = generateCityCode();
              return {
                cityCode,
                name: toCapitalize(city.name) || "",
                state: stateCode,
                country: countryCode,
              };
            });

          if (mappedCities?.length > 0) {
            allCities.push(...mappedCities);

            return {
              stateCode,
              name: toCapitalize(stateName) || "",
              iso: state_code.toUpperCase() || "",
              cities: mappedCities,
              country: countryCode,
            };
          }

          return null;
        })
        ?.filter((state) => state);

      if (
        iso3?.trim()?.length > 0 &&
        iso2?.trim()?.length > 0 &&
        mappedStates?.length > 0
      ) {
        allStates.push(...mappedStates);

        return {
          name: toCapitalize(name) || "",
          iso3: iso3.toUpperCase() || "",
          iso2: iso2.toUpperCase() || "",
          states: mappedStates,
          countryCode,
        };
      }

      return null;
    })
    ?.filter((country) => country);

  return { allCountries, allStates, allCities };
};

const parseCountries = (countries) =>
  countries?.filter(Boolean)?.map(({ countryCode, name, iso3, iso2 }) => {
    return {
      countryCode,
      name,
      iso3,
      iso2,
    };
  });

const parseStates = (states, countries) =>
  states
    ?.filter(Boolean)
    ?.map(({ stateCode, name, iso, country }) => {
      if (countries?.find(({ countryCode }) => countryCode === country)?._id) {
        return {
          stateCode,
          name,
          iso,
          country: countries?.find(({ countryCode }) => countryCode === country)
            ?._id,
        };
      }
      return null;
    })
    ?.filter(Boolean);

const parseCities = (cities, states, countries) =>
  cities
    ?.filter(Boolean)
    ?.map(({ cityCode, name, state, country }) => {
      if (
        states?.find(({ stateCode }) => stateCode === state)?._id &&
        countries?.find(({ countryCode }) => countryCode === country)?._id
      ) {
        return {
          cityCode,
          name,
          state: states?.find(({ stateCode }) => stateCode === state)?._id,
          country: countries?.find(({ countryCode }) => countryCode === country)
            ?._id,
        };
      }
      return null;
    })
    ?.filter(Boolean);

const reduceCountries = (countries) =>
  countries.reduce((acc, current) => {
    const isDuplicate = acc.some(
      (co) =>
        co?.iso3 === current?.iso3 ||
        co?.iso2 === current?.iso2 ||
        co?.name === current?.name
    );

    if (!isDuplicate) acc.push(current);

    return acc;
  }, []);

const reduceStates = (states) =>
  states.reduce((acc, current) => {
    const isDuplicate = acc.some(
      (st) => st?.iso === current?.iso || st?.name === current?.name
    );

    if (!isDuplicate) acc.push(current);

    return acc;
  }, []);

const reduceCities = (cities) =>
  cities.reduce((acc, current) => {
    const isDuplicate = acc.some((ci) => ci?.name === current?.name);

    if (!isDuplicate) acc.push(current);

    return acc;
  }, []);

const { allCountries, allStates, allCities } = getAllValues(data);

const seedCountries = async () => {
  await Country.deleteMany({});

  const parsedCountries = parseCountries(allCountries);
  const reducedCountries = reduceCountries(parsedCountries);

  await Country.insertMany(reducedCountries);
};

const seedStates = async () => {
  await State.deleteMany({});

  const insertedCountries = await Country.find({});

  const parsedStates = parseStates(allStates, insertedCountries);
  const reducedStates = reduceStates(parsedStates);

  await State.insertMany(reducedStates);
};

const seedCities = async () => {
  await City.deleteMany({});

  const insertedCountries = await Country.find({});
  const insertedStates = await State.find({});

  const parsedCities = parseCities(
    allCities,
    insertedStates,
    insertedCountries
  );
  const reducedCities = reduceCities(parsedCities);

  await City.insertMany(reducedCities);
};

seedCountries().then(() => {
  seedStates().then(() => {
    seedCities().then(() => {
      mongoose.connection.close();
    });
  });
});
