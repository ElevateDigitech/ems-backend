require("dotenv").config();
const { default: mongoose } = require("mongoose");
const Gender = require("../models/gender");
const Permission = require("../models/permission");
const AuditLog = require("../models/auditLog");
const Role = require("../models/role");
const User = require("../models/user");
const Country = require("../models/country");
const State = require("../models/state");
const City = require("../models/city");
const Profile = require("../models/profile");
const Class = require("../models/class");
const Section = require("../models/section");
const Subject = require("../models/subject");
const Student = require("../models/student");
const Question = require("../models/question");
const Exam = require("../models/exam");
const QuestionPaper = require("../models/questionPaper");
const Mark = require("../models/mark");

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

const deleteCollectionDocuments = async () => {
  await Gender.deleteMany({});
  await Permission.deleteMany({});
  await AuditLog.deleteMany({});
  await Role.deleteMany({});
  await User.deleteMany({});
  await Country.deleteMany({});
  await State.deleteMany({});
  await City.deleteMany({});
  await Profile.deleteMany({});
  await Class.deleteMany({});
  await Section.deleteMany({});
  await Subject.deleteMany({});
  await Student.deleteMany({});
  await Question.deleteMany({});
  await Exam.deleteMany({});
  await QuestionPaper.deleteMany({});
  await Mark.deleteMany({});
};

deleteCollectionDocuments().then(() => {
  console.log("Deleted all documents");
  mongoose.connection.close();
});
