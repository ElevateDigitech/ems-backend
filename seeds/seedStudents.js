require("dotenv").config();
const { default: mongoose } = require("mongoose");
const Section = require("../models/section");
const Student = require("../models/student");
const { baseStudents } = require("./baseStudents");
const { generateStudentCode } = require("../queries/students");

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

const parseStudents = (baseStudents, sections) => {
  return baseStudents
    ?.map((s) => ({
      studentCode: generateStudentCode(),
      name: s?.Name ?? "",
      rollNumber: s?.Enrollment_Id ?? "",
      section: s?.Class
        ? sections?.find(
            (sec) => sec?.name?.toUpperCase() === s?.Class?.toUpperCase()
          )?._id ?? ""
        : "",
    }))
    ?.filter((s) =>
      Object.values(s)?.every((sv) => `${sv}`?.trim()?.length > 0)
    );
};

const seedStudents = async () => {
  await Student.deleteMany({});
  const sections = await Section.find({});
  const parsedStudents = parseStudents(baseStudents, sections);
  await Student.insertMany(parsedStudents);
};

seedStudents().then(() => {
  console.log("Students seeded");
  mongoose.connection.close();
});
