const moment = require("moment-timezone");
const Class = require("../models/class");
const { hiddenFieldsDefault, generateClassCode } = require("../utils/helpers");
const {
  buildClassPipeline,
  buildClassCountPipeline,
} = require("../pipelines/classes");

/**
 * Retrieves multiple classes from the database with pagination, filtering, and sorting support.
 *
 * @param {Object} params - The parameters for querying classes.
 * @param {Object} [params.query={}] - The MongoDB query object to filter classes.
 * @param {string} [params.keyword=""] - A keyword to search within classes.
 * @param {string} [params.sortField="_id"] - The field to sort the results by.
 * @param {string} [params.sortValue="desc"] - The sorting order, either 'asc' or 'desc'.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of classes to retrieve per page.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing the classes and the total count.
 */
const findClasses = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  // Execute aggregation pipelines concurrently for efficiency.
  const [results, countResult] = await Promise.all([
    Class.aggregate(
      buildClassPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        populate,
        projection,
        all,
      })
    ),
    Class.aggregate(
      buildClassCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract total class count from aggregation result, fallback to 0 if undefined.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return retrieved classes and their total count.
  return { results, totalCount };
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

module.exports = {
  findClasses, // Export function to retrieve multiple classes
  findClass, // Export function to retrieve a single class
  formatClassName, // Export function to format class names
  createClassObj, // Export function to create a new class object
  updateClassObj, // Export function to update an existing class
  deleteClassObj, // Export function to delete a class
};
