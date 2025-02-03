const auditActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  CHANGE: "CHANGE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
};

const auditCollections = {
  ROLES: "ROLES",
  USERS: "USERS",
  PROFILES: "PROFILES",
  GENDERS: "Genders",
  CITIES: "CITIES",
  STATES: "STATES",
  COUNTRIES: "COUNTRIES",
  CLASS: "CLASS",
};

const auditChanges = {
  CREATE_ROLE: "A Role Created",
  UPDATE_ROLE: "A Role Updated",
  DELETE_ROLE: "A Role Deleted",
  LOGIN_USER: "A User Logged in",
  LOGOUT_USER: "A User Logged out",
  CREATE_USER: "A User Created",
  CHANGE_PASSWORD: "A Password Changed",
  UPDATE_USER: "A User Updated",
  DELETE_USER: "A User Deleted",
  CREATE_PROFILE: "A Profile Created",
  UPDATE_PROFILE: "A Profile Updated",
  DELETE_PROFILE: "A Profile Deleted",
  CREATE_GENDER: "A Gender Created",
  UPDATE_GENDER: "A Gender Updated",
  DELETE_GENDER: "A Gender Deleted",
  CREATE_COUNTRY: "A Country Created",
  UPDATE_COUNTRY: "A Country Updated",
  DELETE_COUNTRY: "A Country Deleted",
  CREATE_STATE: "A State Created",
  UPDATE_STATE: "A State Updated",
  DELETE_STATE: "A State Deleted",
  CREATE_CITY: "A City Created",
  UPDATE_CITY: "A City Updated",
  DELETE_CITY: "A City Deleted",
  CREATE_CLASS: "A Class Created",
  UPDATE_CLASS: "A Class Updated",
  DELETE_CLASS: "A Class Deleted",
};

module.exports = { auditActions, auditCollections, auditChanges };
