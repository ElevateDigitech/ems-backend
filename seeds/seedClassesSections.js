require("dotenv").config();
const { default: mongoose } = require("mongoose");
const Class = require("../models/class");
const Section = require("../models/section");
const { baseClassesSections } = require("./baseClassesSections");
const { generateClassCode } = require("../queries/classes");
const { generateSectionCode } = require("../queries/sections");

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

const parseClasses = (baseClassesSections) => {
  return baseClassesSections?.map((p) => {
    const classCode = generateClassCode();
    return {
      classCode: classCode,
      name: p.name,
      sections: p.sections.map((s) => ({
        sectionCode: generateSectionCode(),
        name: `${p.name}${s}`,
        classCode: classCode,
      })),
    };
  });
};

const parsedClasses = parseClasses(baseClassesSections);

const parseSections = (parsedClasses) => {
  const parsedSections = [];
  parsedClasses?.forEach((c) => {
    parsedSections.push(...c.sections);
  });
  return parsedSections;
};

const seedClasses = async () => {
  await Class.deleteMany({});
  const reducedClasses = parsedClasses?.map((c) => ({
    classCode: c?.classCode,
    name: c?.name,
  }));
  await Class.insertMany(reducedClasses);
};

const seedSections = async () => {
  await Section.deleteMany({});
  const classes = await Class.find({});
  const parsedSections = parseSections(parsedClasses);
  const reducedSections = parsedSections?.map((s) => ({
    sectionCode: s.sectionCode,
    name: s.name,
    class: classes.find((c) => c.classCode === s.classCode)._id,
  }));
  await Section.insertMany(reducedSections);
};

seedClasses().then(() => {
  console.log("classes seeded");
  seedSections().then(() => {
    console.log("Sections seeded");
    mongoose.connection.close();
  });
});
