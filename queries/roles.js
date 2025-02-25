const {
  buildRolePipeline,
  buildRolesPipeline,
  buildRoleCountPipeline,
} = require("../pipelines/roles");
const moment = require("moment-timezone");
const Role = require("../models/role");
const { v4: uuidv4 } = require("uuid");

const findRole = async ({
  query = {},
  projection = false,
  populate = false,
}) => {
  const pipeline = buildRolePipeline({ query, projection, populate });
  const result = await Role.aggregate(pipeline);
  return result?.length > 0 ? result[0] : null;
};

const findRoles = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  populate = false,
  all = false,
}) => {
  const [results, countResult] = await Promise.all([
    Role.aggregate(
      buildRolesPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        projection,
        populate,
        all,
      })
    ),
    Role.aggregate(
      buildRoleCountPipeline({
        query,
        keyword,
        populate,
      })
    ),
  ]);

  const totalCount = countResult[0]?.totalCount || 0;
  return { results, totalCount };
};

const formatRoleFields = ({ roleName, roleDescription }) => {
  return {
    formattedRoleName: roleName.trim().toUpperCase(),
    formattedRoleDescription: roleDescription.trim(),
  };
};

const createRoleObj = ({
  roleName,
  roleDescription,
  roleAllowDeletion = true,
  rolePermissions = [],
}) => {
  const role = new Role({
    roleCode: `ROLE-${uuidv4()}`,
    roleName,
    roleDescription,
    roleAllowDeletion,
    rolePermissions,
  });
  return role;
};

const updateRoleObj = async ({
  roleCode,
  roleName,
  roleDescription,
  rolePermissions = [],
}) => {
  const updatedRole = await Role.findOneAndUpdate(
    { roleCode },
    {
      roleName,
      roleDescription,
      rolePermissions,
      updatedAt: moment().valueOf(),
    }
  );

  return updatedRole;
};

const deleteRoleObj = async (roleCode) => {
  return await Role.deleteOne({ roleCode });
};

module.exports = {
  findRole,
  findRoles,
  formatRoleFields,
  createRoleObj,
  updateRoleObj,
  deleteRoleObj,
};
