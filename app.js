if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");

const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const { permissionsRoutes } = require("./routes/permissions");
const { auditLogRoutes } = require("./routes/auditLogs");
const { rolesRoutes } = require("./routes/roles");
const { usersRoutes } = require("./routes/users");
const { genderRoutes } = require("./routes/genders");
const { countryRoutes } = require("./routes/countries");
const { stateRoutes } = require("./routes/states");
const { cityRoutes } = require("./routes/cities");
const { profileRoutes } = require("./routes/profiles");
const { classRoutes } = require("./routes/classes");
const { sectionRoutes } = require("./routes/sections");
const { subjectRoutes } = require("./routes/subjects");
const { studentRoutes } = require("./routes/students");

const { hiddenFieldsUser, hiddenFieldsDefault } = require("./utils/helpers");
const { STATUS_ERROR } = require("./utils/status");
const {
  STATUS_CODE_PAGE_NOT_FOUND,
  STATUS_CODE_BAD_REQUEST,
} = require("./utils/statusCodes");
const {
  MESSAGE_PAGE_NOT_FOUND,
  MESSAGE_SCHEMA_VALIDATION_ERROR,
} = require("./utils/messages");
const ExpressResponse = require("./utils/ExpressResponse");

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
  // useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SECRET,
  },
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR", e);
});

const secret = process.env.SECRET;

const sessionConfig = {
  store: store,
  name: "session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(helmet());

const scriptSrcUrls = [];
const styleSrcUrls = [];
const connectSrcUrls = [];
const imgSrc = [
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME ?? ""}/`,
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", "blob:", "data:", ...imgSrc],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser((user, done) => {
  done(null, user.userCode);
});
passport.deserializeUser(async (userCode, done) => {
  try {
    const user = await User.findOne({ userCode }, hiddenFieldsUser).populate({
      path: "role",
      select: hiddenFieldsDefault,
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use((req, res, next) => {
  res.locals.returnTo = req.session.returnTo;
  res.locals.currentUser = req.user;
  next();
});

app.use("/", permissionsRoutes);
app.use("/", auditLogRoutes);
app.use("/", rolesRoutes);
app.use("/", usersRoutes);
app.use("/", genderRoutes);
app.use("/", countryRoutes);
app.use("/", stateRoutes);
app.use("/", cityRoutes);
app.use("/", profileRoutes);
app.use("/", classRoutes);
app.use("/", sectionRoutes);
app.use("/", subjectRoutes);
app.use("/", studentRoutes);

app.all("*", (req, res, next) => {
  return res
    .status(STATUS_CODE_PAGE_NOT_FOUND)
    .send(
      new ExpressResponse(
        STATUS_ERROR,
        STATUS_CODE_PAGE_NOT_FOUND,
        MESSAGE_PAGE_NOT_FOUND
      )
    );
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (err instanceof mongoose.Error.ValidationError) {
    const error = new ExpressResponse(
      STATUS_ERROR,
      STATUS_CODE_BAD_REQUEST,
      Object.values(err.errors)
        .map((e) => e.message)
        .join(", ") ?? MESSAGE_SCHEMA_VALIDATION_ERROR
    );
    res.status(STATUS_CODE_BAD_REQUEST).send(error);
  } else if (!err?.message) {
    err.message = "Something went wrong";
  }
  res.status(statusCode).send(err);
});
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
