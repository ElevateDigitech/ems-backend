const moment = require("moment-timezone");
const Role = require("../models/role");
const { generateRoleCode } = require("../utils/helpers");
const {
  buildRoleCountPipeline,
  buildRolesPipeline,
  buildRolePipeline,
} = require("../pipelines/roles");

/**
 * Retrieves a single role from the database using an aggregation pipeline.
 *
 * @param {Object} params - The parameters for querying a role.
 * @param {Object} [params.query={}] - The MongoDB query object to filter the role.
 * @param {boolean} [params.projection=false] - Whether to apply field projection in the aggregation pipeline.
 * @param {boolean} [params.populate=false] - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the role object or null if not found.
 */
const findRole = async ({
  query = {}, // The MongoDB query object to filter the role document..
  projection = false, // Boolean indicating whether to apply field projection in the aggregation pipeline.
  populate = false, // Boolean indicating whether to populate fields.
}) => {
  // Build the aggregation pipeline with the provided query and projection.
  const pipeline = buildRolePipeline({ query, projection, populate });

  // Execute the aggregation pipeline using the role model.
  const result = await Role.aggregate(pipeline);

  // Since we expect a single role, return the first document or null if not found.
  return result.length > 0 ? result[0] : null;
};

/**
 * Retrieves all roles from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying roles.
 * @param {Object} [params.query={}] - The MongoDB query object to filter roles.
 * @param {String} [params.keyword=""] - Keyword to filter across all fields in roles.
 * @param {String} [params.sortField="_id"] - Field to sort in roles.
 * @param {String} [params.sortValue="desc"] - Sort direction: either 'asc' or 'desc'.
 * @param {number} [params.page=1] - The page number for pagination (default is 1).
 * @param {number} [params.limit=10] - The number of records per page (default is 10).
 * @param {boolean} [params.projection=false] - Whether to apply field projection in the aggregation pipeline.
 * @param {boolean} [params.populate=false] - Determines if related data should be populated.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing roles and total count.
 */
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
  // Execute both data query and total count query concurrently
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
      })
    ),
  ]);

  // Extract total count from aggregation result
  const totalCount = countResult[0]?.totalCount || 0;

  return { results, totalCount };
};

/**
 * Formats role fields by trimming whitespace and capitalizing the role name.
 *
 * @param {Object} params - The role details to format.
 * @param {string} params.roleName - The role name to format.
 * @param {string} params.roleDescription - The role description to format.
 * @returns {Object} - The formatted role details.
 */
const formatRoleFields = ({ roleName, roleDescription }) => {
  return {
    formattedRoleName: roleName.trim().toUpperCase(), // Step 1: Format the role name
    formattedRoleDescription: roleDescription.trim(), // Step 2: Format the role description
  };
};

/**
 * Creates a new role object.
 *
 * @param {Object} params - The parameters to create the role object.
 * @param {string} params.roleName - The name of the role.
 * @param {string} params.roleDescription - The description of the role.
 * @param {boolean} params.roleAllowDeletion - Flag to allow deletion.
 * @param {Array} params.rolePermissions - List of permissions associated with the role.
 * @returns {Object} - The newly created role object.
 */
const createRoleObj = async ({
  roleName,
  roleDescription,
  roleAllowDeletion,
  rolePermissions,
}) => {
  const roleCode = generateRoleCode(); // Step 1: Generate a unique role code

  // Step 2: Create and return the new role object
  return new Role({
    roleCode,
    roleName,
    roleDescription,
    roleAllowDeletion,
    rolePermissions,
  });
};

/**
 * Updates an existing role in the database.
 *
 * @param {Object} params - The parameters for updating the role.
 * @param {string} params.roleCode - The unique code of the role to update.
 * @param {string} params.roleName - The new name for the role.
 * @param {string} params.roleDescription - The new description for the role.
 * @param {Array} params.rolePermissions - Updated list of role permissions.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated role object.
 */
const updateRoleObj = async ({
  roleCode,
  roleName,
  roleDescription,
  rolePermissions,
}) => {
  // Step 1: Update the role document with new details
  return await Role.findOneAndUpdate(
    { roleCode },
    {
      roleName,
      roleDescription,
      rolePermissions,
      updatedAt: moment().valueOf(), // Update the timestamp
    }
  );
};

/**
 * Deletes a role from the database.
 *
 * @param {string} roleCode - The unique code of the role to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteRoleObj = async (roleCode) => {
  return await Role.deleteOne({ roleCode }); // Step 1: Delete the role by roleCode
};

module.exports = {
  findRole, // Export function to retrieve a single role
  findRoles, // Export function to retrieve multiple roles
  formatRoleFields, // Export function to format role fields
  createRoleObj, // Export function to create a new role
  updateRoleObj, // Export function to update an existing role
  deleteRoleObj, // Export function to delete a role
};
