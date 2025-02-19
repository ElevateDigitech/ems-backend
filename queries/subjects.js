const moment = require("moment-timezone");
const Subject = require("../models/subject");
const {
  hiddenFieldsDefault,
  generateSubjectCode,
} = require("../utils/helpers");
const {
  buildSubjectPipeline,
  buildSubjectCountPipeline,
} = require("../pipelines/subjects");

/**
 * Retrieves multiple subjects from the database with pagination, search, and sorting support.
 *
 * @param {Object} params - The parameters for querying subjects.
 * @param {Object} [params.query={}] - The MongoDB query object to filter subjects.
 * @param {string} [params.keyword=""] - The keyword for searching within subjects.
 * @param {string} [params.sortField="_id"] - The field to sort results by (default is _id).
 * @param {string} [params.sortValue="desc"] - The sorting order: 'asc' for ascending, 'desc' for descending (default is 'desc').
 * @param {number} [params.page=1] - The page number for pagination (default is 1).
 * @param {number} [params.limit=10] - The number of subjects per page (default is 10).
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise that resolves to an object containing the results array and total count of subjects.
 */
const findSubjects = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  projection = false,
  all = false,
}) => {
  // Fetch both paginated results and the total count of matching subjects concurrently
  const [results, countResult] = await Promise.all([
    Subject.aggregate(
      buildSubjectPipeline({
        query,
        keyword,
        sortField,
        sortValue,
        page,
        limit,
        projection,
        all,
      })
    ),
    Subject.aggregate(
      buildSubjectCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract total count from aggregation result
  const totalCount = countResult[0]?.totalCount || 0;

  // Return results and total count
  return { results, totalCount };
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
