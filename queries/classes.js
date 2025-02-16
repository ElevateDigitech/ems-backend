const moment = require("moment-timezone");
const Class = require("../models/class");
const {
  hiddenFieldsDefault,
  generateClassCode,
  getLimitAndSkip,
} = require("../utils/helpers");

/**
 * Retrieves multiple classes from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying classes.
 * @param {Object} params.query - The MongoDB query object to filter classes.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of classes.
 */
const findClasses = async ({
  query = {}, // MongoDB query object to filter classes
  options = false, // Fields to include/exclude in the result
  page = 1, // Current page for pagination (default is 1)
  perPage = 10, // Items per page for pagination (default is 10)
}) => {
  // Step 1: Calculate the limit and skip values for pagination
  const { limit, skip } = getLimitAndSkip(page, perPage);

  // Step 2: Query the database with provided filters, apply pagination (skip & limit)
  return await Class.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip) // Apply skip for pagination
    .limit(limit); // Apply limit to control number of results
};

/**
 * Retrieves a single class from the database.
 *
 * @param {Object} params - The parameters for querying a class.
 * @param {Object} params.query - The MongoDB query object to filter the class.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the class object or null if not found.
 */
const findClass = async ({
  query = {}, // MongoDB query object to filter the class
  options = false, // Fields to include/exclude in the result
}) => {
  // Step 1: Query the database to find a single class based on the query criteria
  return await Class.findOne(query, options ? hiddenFieldsDefault : {});
};

/**
 * Formats a class name by trimming whitespace and converting it to uppercase.
 *
 * @param {string} name - The class name to format.
 * @returns {string} - The formatted class name.
 */
const formatClassName = (name) => {
  // Step 1: Trim whitespace and convert the name to uppercase
  return name.trim().toUpperCase();
};

/**
 * Creates a new class object.
 *
 * @param {Object} params - The parameters to create the class object.
 * @param {string} params.name - The name of the class.
 * @returns {Object} - The newly created class object.
 */
const createClassObj = async ({ name }) => {
  // Step 1: Generate a unique class code
  const classCode = generateClassCode();

  // Step 2: Create a new Class object with the generated code and provided name
  return new Class({
    classCode,
    name,
  });
};

/**
 * Updates an existing class in the database.
 *
 * @param {Object} params - The parameters for updating the class.
 * @param {string} params.classCode - The unique code of the class to update.
 * @param {string} params.name - The new name for the class.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated class object.
 */
const updateClassObj = async ({ classCode, name }) => {
  // Step 1: Update the class document with the provided classCode
  return await Class.findOneAndUpdate(
    { classCode }, // Query to find the class by classCode
    {
      name, // Update the class name
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a class from the database.
 *
 * @param {string} classCode - The unique code of the class to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteClassObj = async (classCode) => {
  // Step 1: Delete the class document with the provided classCode
  return await Class.deleteOne({ classCode });
};

const getClassPaginationObject = async (page, perPage) => ({
  page,
  perPage,
  total: await Class.countDocuments(),
});

module.exports = {
  findClasses, // Export function to retrieve multiple classes
  findClass, // Export function to retrieve a single class
  formatClassName, // Export function to format class names
  createClassObj, // Export function to create a new class object
  updateClassObj, // Export function to update an existing class
  deleteClassObj, // Export function to delete a class
  getClassPaginationObject,
};
