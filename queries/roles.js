const moment = require("moment-timezone");
const Role = require("../models/role");
const {
  hiddenFieldsDefault,
  getLimitAndSkip,
  generateroleCode,
  generateRoleCode,
} = require("../utils/helpers");

/**
 * Retrieves all exams from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying exams.
 * @param {Object} params.query - The MongoDB query object to filter exams.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @param {boolean} params.populated - The ending index for pagination (default is 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of exams.
 */
const findRoles = async ({
  query = {}, // MongoDB query object to filter exams
  options = false, // Fields to include/exclude in the result
  start = 1, // Starting index for pagination (default is 1)
  end = 10, // Ending index for pagination (default is 10)
  populated = false,
}) => {
  // Step 1: Calculate the limit and skip values for pagination
  const { limit, skip } = getLimitAndSkip(start, end);

  // Step 2: Query the database with provided filters, apply pagination (skip & limit)
  return populated
    ? await Role.find(query, options ? hiddenFieldsDefault : {})
        .skip(skip) // Apply skip for pagination
        .limit(limit)
        .populate("rolePermissions", hiddenFieldsDefault)
    : await Role.find(query, options ? hiddenFieldsDefault : {})
        .skip(skip) // Apply skip for pagination
        .limit(limit); // Apply limit to control number of results
};

/**
 * Retrieves a single exam from the database.
 *
 * @param {Object} params - The parameters for querying an exam.
 * @param {Object} params.query - The MongoDB query object to filter the exam.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {Object} params.populated - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the exam object or null if not found.
 */
const findRole = async ({
  query = {}, // MongoDB query object to filter the exam
  options = false, // Fields to include/exclude in the result
  populated = false,
}) => {
  // Step 1: Query the database to find a single exam based on the query criteria
  return populated
    ? await Role.findOne(query, options ? hiddenFieldsDefault : {}).populate(
        "rolePermissions",
        hiddenFieldsDefault
      )
    : await Role.findOne(query, options ? hiddenFieldsDefault : {});
};

/**
 * Formats an exam title by trimming whitespace and converting it to uppercase.
 *
 * @param {string} title - The exam title to format.
 * @returns {string} - The formatted exam title.
 */
const formatRoleFields = ({ roleName, roleDescription }) => {
  // Step 1: Trim whitespace and convert the name to uppercase
  return {
    formattedRoleName: roleName.trim().toUpperCase(),
    formattedRoleDescription: roleDescription.trim(),
  };
};

/**
 * Creates a new exam object.
 *
 * @param {Object} params - The parameters to create the exam object.
 * @param {string} params.title - The title of the exam.
 * @returns {Object} - The newly created exam object.
 */
const createRoleObj = async ({
  roleName,
  roleDescription,
  roleAllowDeletion,
  rolePermissions,
}) => {
  // Step 1: Generate a unique exam code
  const roleCode = generateRoleCode();

  // Step 2: Create a new Exam object with the generated code and provided title
  return new Role({
    roleCode,
    roleName,
    roleDescription,
    roleAllowDeletion,
    rolePermissions,
  });
};

/**
 * Updates an existing exam in the database.
 *
 * @param {Object} params - The parameters for updating the exam.
 * @param {string} params.roleCode - The unique code of the exam to update.
 * @param {string} params.title - The new title for the exam.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated exam object.
 */
const updateRoleObj = async ({
  roleCode,
  roleName,
  roleDescription,
  rolePermissions,
}) => {
  // Step 1: Update the exam document with the provided roleCode
  return await Role.findOneAndUpdate(
    { roleCode }, // Query to find the exam by roleCode
    {
      roleName,
      roleDescription,
      rolePermissions,
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes an exam from the database.
 *
 * @param {string} roleCode - The unique code of the exam to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteRoleObj = async (roleCode) => {
  // Step 1: Delete the exam document with the provided roleCode
  return await Role.deleteOne({ roleCode });
};

module.exports = {
  findRoles, // Export function to retrieve multiple exams
  findRole, // Export function to retrieve a single exam
  formatRoleFields, // Export function to format exam titles
  createRoleObj, // Export function to create a new exam object
  updateRoleObj, // Export function to update an existing exam
  deleteRoleObj, // Export function to delete an exam
};
