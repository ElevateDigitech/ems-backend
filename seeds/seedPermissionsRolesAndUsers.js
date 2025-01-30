require("dotenv").config();
const { default: mongoose } = require("mongoose");
const Permission = require("../models/permission");
const Role = require("../models/role");
const User = require("../models/user");
const {
  generatePermissionCode,
  generateRoleCode,
  generateUserCode,
  hiddenFieldsDefault,
  writeToFile,
} = require("../utils/helpers");
const { basePermissions } = require("./basePermissions");
const { baseRoles } = require("./baseRoles");

mongoose.connect("mongodb://127.0.0.1:27017/mongoexpress", {
  useNewUrlParser: true,
  // useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const parsePermissions = (basePermissions) => {
  return basePermissions?.map((p) => ({
    ...p,
    permissionCode: generatePermissionCode(),
  }));
};

const parseRoles = (roles, permissions, onlyId) => {
  return roles?.map((role) => ({
    ...role,
    roleCode: generateRoleCode(),
    rolePermissions:
      role?.rolePermissions
        ?.map((rp) =>
          onlyId
            ? permissions?.find(
                (perm) => perm?.permissionName === rp?.permissionName
              )?._id ?? null
            : permissions?.find(
                (perm) => perm?.permissionName === rp?.permissionName
              ) ?? null
        )
        ?.filter(Boolean) ?? [],
  }));
};

const seedPermissions = async () => {
  await Permission.deleteMany({});

  const parsedPermissions = parsePermissions(basePermissions);

  await Permission.insertMany(parsedPermissions);
};

const seedRoles = async () => {
  await Role.deleteMany({});

  const permissions = await Permission.find({});
  const mappedRoles = parseRoles(baseRoles, permissions, true);

  await Role.insertMany(mappedRoles);
};

const seedUsers = async () => {
  await User.deleteMany({});

  const roles = await Role.find({});
  const adminRoleId = roles?.find((r) => r?.roleName === "ADMIN")?._id ?? "";
  const userObj = {
    userCode: generateUserCode(),
    email:
      process?.env?.ADMIN_MAIL_ID?.trim()?.length > 0
        ? process?.env?.ADMIN_MAIL_ID
        : "admin@localhost.in",
    username:
      process?.env?.ADMIN_USERNAME?.trim()?.length > 0
        ? process?.env?.ADMIN_USERNAME
        : "admin",
    userAllowDeletion: false,
    role: adminRoleId,
  };

  const user = new User(userObj);
  await User.register(
    user,
    process?.env?.ADMIN_PASSWORD?.trim()?.length > 0
      ? process?.env?.ADMIN_PASSWORD
      : "admin@1234"
  );
};

seedPermissions().then(() => {
  seedRoles().then(() => {
    seedUsers().then(() => {
      mongoose.connection.close();
    });
  });
});
