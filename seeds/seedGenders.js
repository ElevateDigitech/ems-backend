require("dotenv").config();
const { default: mongoose } = require("mongoose");
const Gender = require("../models/gender");
const { generateGenderCode } = require("../utils/helpers");
const { baseGenders } = require("./basrGenders");

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

const parseGenders = (baseGenders) => {
  return baseGenders?.map((p) => ({
    ...p,
    genderCode: generateGenderCode(),
  }));
};

const seedPermissions = async () => {
  await Gender.deleteMany({});

  const parsedGenders = parseGenders(baseGenders);

  await Gender.insertMany(parsedGenders);
};

seedPermissions().then(() => {
  mongoose.connection.close();
});
