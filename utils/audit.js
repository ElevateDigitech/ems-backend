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
  CREATE_GENDER: "A Gender Created",
  UPDATE_GENDER: "A Gender Updated",
  DELETE_GENDER: "A Gender Deleted",
  CREATE_COUNTRY: "A Country Created",
  UPDATE_COUNTRY: "A Country Updated",
  DELETE_COUNTRY: "A Country Deleted",
};

module.exports = { auditActions, auditCollections, auditChanges };
