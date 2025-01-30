const { basePermissions, allPermissions } = require("./basePermissions");

const teacherPermissions = [
  allPermissions?.CHANGE_OWN_PASSWORD,
  allPermissions?.VIEW_OWN_PROFILE_ONLY,
  allPermissions?.VIEW_OWN_USER_ONLY,
  allPermissions?.VIEW_OWN_ROLE_ONLY,
];

const guestPermissions = [
  allPermissions?.CHANGE_OWN_PASSWORD,
  allPermissions?.VIEW_OWN_PROFILE_ONLY,
  allPermissions?.VIEW_OWN_USER_ONLY,
  allPermissions?.VIEW_OWN_ROLE_ONLY,
];

module.exports.baseRoles = [
  {
    roleName: "ADMIN",
    roleDescription: "System Admin",
    roleAllowDeletion: false,
    rolePermissions: basePermissions,
  },
  {
    roleName: "TEACHER",
    roleDescription: "Teaching staff",
    roleAllowDeletion: false,
    rolePermissions:
      basePermissions?.filter((p) =>
        teacherPermissions.includes(p?.permissionName)
      ) ?? [],
  },
  {
    roleName: "GUEST USER",
    roleDescription: "Guest / default user",
    roleAllowDeletion: false,
    rolePermissions:
      basePermissions?.filter((p) =>
        guestPermissions.includes(p?.permissionName)
      ) ?? [],
  },
];
