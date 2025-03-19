require("dotenv").config();
const { default: mongoose } = require("mongoose");
const Question = require("../models/question");
const { generateQuestionCode } = require("../utils/helpers");
const { baseQuestions } = require("./baseQuestions");

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

const parseQuestions = (baseQuestions) => {
  return baseQuestions?.map((p) => ({
    ...p,
    questionCode: generateQuestionCode(),
  }));
};

const seedQuestions = async () => {
  await Question.deleteMany({});
  const parsedQuestions = parseQuestions(baseQuestions);
  await Question.insertMany(parsedQuestions);
};

seedQuestions().then(() => {
  console.log("Questions seeded");
  mongoose.connection.close();
});
