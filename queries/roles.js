const moment = require("moment-timezone");
const Role = require("../models/role");
const {
  hiddenFieldsDefault,
  getLimitAndSkip,
  generateRoleCode,
} = require("../utils/helpers");

/**
 * Retrieves all roles from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying roles.
 * @param {Object} params.query - The MongoDB query object to filter roles.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Array>} - A promise that resolves to an array of roles.
 */
const findRoles = async ({
  query = {},
  options = false,
  start = 1,
  end = 10,
  populated = false,
}) => {
  const { limit, skip } = getLimitAndSkip(start, end); // Step 1: Calculate pagination parameters

  // Step 2: Build the base query
  const rolesQuery = Role.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip)
    .limit(limit);

  // Step 3: Conditionally populate related data
  return populated
    ? rolesQuery.populate("rolePermissions", hiddenFieldsDefault)
    : rolesQuery;
};

/**
 * Retrieves a single role from the database.
 *
 * @param {Object} params - The parameters for querying a role.
 * @param {Object} params.query - The MongoDB query object to filter the role.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the role object or null if not found.
 */
const findRole = async ({ query = {}, options = false, populated = false }) => {
  const roleQuery = Role.findOne(query, options ? hiddenFieldsDefault : {}); // Step 1: Build the base query

  // Step 2: Conditionally populate related data
  return populated
    ? roleQuery.populate("rolePermissions", hiddenFieldsDefault)
    : roleQuery;
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
  findRoles, // Export function to retrieve multiple roles
  findRole, // Export function to retrieve a single role
  formatRoleFields, // Export function to format role fields
  createRoleObj, // Export function to create a new role
  updateRoleObj, // Export function to update an existing role
  deleteRoleObj, // Export function to delete a role
};
