const allPermissions = {
  VIEW_PERMISSIONS: "VIEW PERMISSIONS",
  VIEW_ROLES: "VIEW ROLES",
  VIEW_OWN_ROLE_ONLY: "VIEW OWN ROLE ONLY",
  CREATE_ROLE: "CREATE ROLE",
  UPDATE_ROLE: "UPDATE ROLE",
  DELETE_ROLE: "DELETE ROLE",
  VIEW_USER: "VIEW USER",
  VIEW_OWN_USER_ONLY: "VIEW OWN USER ONLY",
  CREATE_USER: "CREATE USER",
  UPDATE_USER: "UPDATE USER",
  DELETE_USER: "DELETE USER",
  CHANGE_PASSWORDS: "CHANGE PASSWORDS",
  CHANGE_OWN_PASSWORD: "CHANGE OWN PASSWORD",
  VIEW_PROFILE: "VIEW PROFILE",
  VIEW_OWN_PROFILE_ONLY: "VIEW OWN PROFILE ONLY",
  CREATE_PROFILE: "CREATE PROFILE",
  UPDATE_PROFILE: "UPDATE PROFILE",
  DELETE_PROFILE: "DELETE PROFILE",
  VIEW_GENDER: "VIEW GENDER",
  CREATE_GENDER: "CREATE GENDER",
  UPDATE_GENDER: "UPDATE GENDER",
  DELETE_GENDER: "DELETE GENDER",
  VIEW_COUNTRY: "VIEW COUNTRY",
  CREATE_COUNTRY: "CREATE COUNTRY",
  UPDATE_COUNTRY: "UPDATE COUNTRY",
  DELETE_COUNTRY: "DELETE COUNTRY",
  VIEW_STATE: "VIEW STATE",
  CREATE_STATE: "CREATE STATE",
  UPDATE_STATE: "UPDATE STATE",
  DELETE_STATE: "DELETE STATE",
  VIEW_CITY: "VIEW CITY",
  CREATE_CITY: "CREATE CITY",
  UPDATE_CITY: "UPDATE CITY",
  DELETE_CITY: "DELETE CITY",
  VIEW_AUDIT: "VIEW AUDIT",
  VIEW_CLASS: "VIEW CLASS",
  CREATE_CLASS: "CREATE CLASS",
  UPDATE_CLASS: "UPDATE CLASS",
  DELETE_CLASS: "DELETE CLASS",
};

const basePermissions = [
  {
    permissionName: allPermissions?.VIEW_PERMISSIONS,
    permissionDescription: "can view permissions",
  },
  {
    permissionName: allPermissions?.VIEW_ROLES,
    permissionDescription: "can view roles",
  },
  {
    permissionName: allPermissions?.VIEW_OWN_ROLE_ONLY,
    permissionDescription: "only view own role",
  },
  {
    permissionName: allPermissions?.CREATE_ROLE,
    permissionDescription: "can create role",
  },
  {
    permissionName: allPermissions?.UPDATE_ROLE,
    permissionDescription: "can modify role",
  },
  {
    permissionName: allPermissions?.DELETE_ROLE,
    permissionDescription: "can delete role",
  },
  {
    permissionName: allPermissions?.VIEW_USER,
    permissionDescription: "can view users",
  },
  {
    permissionName: allPermissions?.VIEW_OWN_USER_ONLY,
    permissionDescription: "only view own user",
  },
  {
    permissionName: allPermissions?.CREATE_USER,
    permissionDescription: "can create user",
  },
  {
    permissionName: allPermissions?.UPDATE_USER,
    permissionDescription: "can modify user",
  },
  {
    permissionName: allPermissions?.DELETE_USER,
    permissionDescription: "can delete user",
  },
  {
    permissionName: allPermissions?.CHANGE_PASSWORDS,
    permissionDescription: "can change passwords",
  },
  {
    permissionName: allPermissions?.CHANGE_OWN_PASSWORD,
    permissionDescription: "can only change own password",
  },
  {
    permissionName: allPermissions?.VIEW_PROFILE,
    permissionDescription: "can view profiles",
  },
  {
    permissionName: allPermissions?.VIEW_OWN_PROFILE_ONLY,
    permissionDescription: "only view own profile",
  },
  {
    permissionName: allPermissions?.CREATE_PROFILE,
    permissionDescription: "can create profile",
  },
  {
    permissionName: allPermissions?.UPDATE_PROFILE,
    permissionDescription: "can modily profile",
  },
  {
    permissionName: allPermissions?.DELETE_PROFILE,
    permissionDescription: "can delete profile",
  },
  {
    permissionName: allPermissions?.VIEW_GENDER,
    permissionDescription: "can view gender",
  },
  {
    permissionName: allPermissions?.CREATE_GENDER,
    permissionDescription: "can create gender",
  },
  {
    permissionName: allPermissions?.UPDATE_GENDER,
    permissionDescription: "can modify gender",
  },
  {
    permissionName: allPermissions?.DELETE_GENDER,
    permissionDescription: "can delete gender",
  },
  {
    permissionName: allPermissions?.VIEW_COUNTRY,
    permissionDescription: "can view country",
  },
  {
    permissionName: allPermissions?.CREATE_COUNTRY,
    permissionDescription: "can create country",
  },
  {
    permissionName: allPermissions?.UPDATE_COUNTRY,
    permissionDescription: "can modify country",
  },
  {
    permissionName: allPermissions?.DELETE_COUNTRY,
    permissionDescription: "can modify country",
  },
  {
    permissionName: allPermissions?.VIEW_STATE,
    permissionDescription: "can view states",
  },
  {
    permissionName: allPermissions?.CREATE_STATE,
    permissionDescription: "can create state",
  },
  {
    permissionName: allPermissions?.UPDATE_STATE,
    permissionDescription: "can modify state",
  },
  {
    permissionName: allPermissions?.DELETE_STATE,
    permissionDescription: "can delete state",
  },
  {
    permissionName: allPermissions?.VIEW_CITY,
    permissionDescription: "can view cities",
  },
  {
    permissionName: allPermissions?.CREATE_CITY,
    permissionDescription: "can create city",
  },
  {
    permissionName: allPermissions?.UPDATE_CITY,
    permissionDescription: "can update city",
  },
  {
    permissionName: allPermissions?.DELETE_CITY,
    permissionDescription: "can delete city",
  },
  {
    permissionName: allPermissions?.VIEW_AUDIT,
    permissionDescription: "can view log entries",
  },
  {
    permissionName: allPermissions?.VIEW_CLASS,
    permissionDescription: "can view classes",
  },
  {
    permissionName: allPermissions?.CREATE_CLASS,
    permissionDescription: "can create class",
  },
  {
    permissionName: allPermissions?.UPDATE_CLASS,
    permissionDescription: "can update class",
  },
  {
    permissionName: allPermissions?.DELETE_CLASS,
    permissionDescription: "can delete class",
  },
];

module.exports = { basePermissions, allPermissions };
