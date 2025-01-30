const referenceFields = [
  { model: "Role", field: "rolePermissions" },
  { model: "User", field: "role" },
  { model: "Profile", field: "user" },
  { model: "State", field: "country" },
];

module.exports = { referenceFields };
