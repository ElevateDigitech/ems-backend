const auditActions = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  CHANGE: "CHANGE",
  DELETE: "DELETE",
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
};

module.exports = { auditActions, auditCollections, auditChanges };
