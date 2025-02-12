const moment = require("moment-timezone");
const Subject = require("../models/subject");
const {
  hiddenFieldsDefault,
  generateSubjectCode,
  getLimitAndSkip,
} = require("../utils/helpers");

/**
 * Retrieves multiple subjects from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying subjects.
 * @param {Object} params.query - The MongoDB query object to filter subjects.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of subjects.
 */
const findSubjects = async ({
  query = {}, // MongoDB query object to filter subjects
  options = false, // Fields to include/exclude in the result
  start = 1, // Starting index for pagination (default is 1)
  end = 10, // Ending index for pagination (default is 10)
}) => {
  // Step 1: Calculate the limit and skip values for pagination
  const { limit, skip } = getLimitAndSkip(start, end);

  // Step 2: Query the database with provided filters, apply pagination (skip & limit)
  return await Subject.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip) // Apply skip for pagination
    .limit(limit); // Apply limit to control number of results
};

/**
 * Retrieves a single subject from the database.
 *
 * @param {Object} params - The parameters for querying a subject.
 * @param {Object} params.query - The MongoDB query object to filter the subject.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the subject object or null if not found.
 */
const findSubject = async ({
  query = {}, // MongoDB query object to filter the subject
  options = false, // Fields to include/exclude in the result
}) => {
  // Step 1: Query the database to find a single subject based on the query criteria
  return await Subject.findOne(query, options ? hiddenFieldsDefault : {});
};

/**
 * Formats a subject name by trimming whitespace and converting it to uppercase.
 *
 * @param {string} name - The subject name to format.
 * @returns {string} - The formatted subject name.
 */
const formatSubjectName = (name) => {
  // Step 1: Trim whitespace and convert the name to uppercase
  return name.trim().toUpperCase();
};

/**
 * Creates a new subject object.
 *
 * @param {Object} params - The parameters to create the subject object.
 * @param {string} params.name - The name of the subject.
 * @returns {Object} - The newly created subject object.
 */
const createSubjectObj = async ({ name }) => {
  // Step 1: Generate a unique subject code
  const subjectCode = generateSubjectCode();

  // Step 2: Create a new Subject object with the generated code and provided name
  return new Subject({
    subjectCode,
    name,
  });
};

/**
 * Updates an existing subject in the database.
 *
 * @param {Object} params - The parameters for updating the subject.
 * @param {string} params.subjectCode - The unique code of the subject to update.
 * @param {string} params.name - The new name for the subject.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated subject object.
 */
const updateSubjectObj = async ({ subjectCode, name }) => {
  // Step 1: Update the subject document with the provided subjectCode
  return await Subject.findOneAndUpdate(
    { subjectCode }, // Query to find the subject by subjectCode
    {
      name, // Update the subject name
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a subject from the database.
 *
 * @param {string} subjectCode - The unique code of the subject to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteSubjectObj = async (subjectCode) => {
  // Step 1: Delete the subject document with the provided subjectCode
  return await Subject.deleteOne({ subjectCode });
};

module.exports = {
  findSubjects, // Export function to retrieve multiple subjects
  findSubject, // Export function to retrieve a single subject
  formatSubjectName, // Export function to format subject names
  createSubjectObj, // Export function to create a new subject object
  updateSubjectObj, // Export function to update an existing subject
  deleteSubjectObj, // Export function to delete a subject
};
