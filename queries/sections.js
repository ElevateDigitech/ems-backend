const moment = require("moment-timezone");
const Section = require("../models/section");
const {
  hiddenFieldsDefault,
  toCapitalize,
  generateSectionCode,
} = require("../utils/helpers");
const {
  buildSectionPipeline,
  buildSectionCountPipeline,
} = require("../pipelines/sections");

/**
 * Retrieves sections from the database with support for keyword search, sorting, pagination, and optional population of related data.
 *
 * @param {Object} params - The parameters for querying sections.
 * @param {Object} [params.query={}] - The MongoDB query object to filter sections.
 * @param {string} [params.keyword=""] - A search keyword for filtering sections based on relevant fields.
 * @param {string} [params.sortField="_id"] - The field by which results will be sorted.
 * @param {string} [params.sortValue="desc"] - The sort direction: 'asc' for ascending, 'desc' for descending.
 * @param {number} [params.page=1] - The current page number for pagination.
 * @param {number} [params.limit=10] - The number of results per page.
 * @param {boolean} [params.populate=false] - Determines whether related data should be populated.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 * @returns {Promise<{results: Array, totalCount: number}>} - A promise resolving to an object containing the results and total count.
 */
const findSections = async ({
  query = {},
  keyword = "",
  sortField = "_id",
  sortValue = "desc",
  page = 1,
  limit = 10,
  populate = false,
  projection = false,
  all = false,
}) => {
  // Perform parallel aggregation queries:
  // 1. Fetch paginated and filtered sections with optional population and projection.
  // 2. Count the total number of sections matching the query and keyword (ignoring pagination).
  const [results, countResult] = await Promise.all([
    Section.aggregate(
      buildSectionPipeline({
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
    Section.aggregate(
      buildSectionCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract the total count from the aggregation result.
  const totalCount = countResult[0]?.totalCount || 0;

  // Return both the results and the total count for pagination.
  return { results, totalCount };
};

/**
 * Retrieves a single section from the database.
 *
 * @param {Object} params - The parameters for querying a section.
 * @param {Object} params.query - The MongoDB query object to filter the section.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the section object or null if not found.
 */
const findSection = async ({
  query = {},
  options = false,
  populated = false,
}) => {
  const sectionQuery = Section.findOne(
    query,
    options ? hiddenFieldsDefault : {}
  ); // Step 1: Build the base query

  // Step 2: Conditionally populate related data
  return populated
    ? sectionQuery.populate("class", hiddenFieldsDefault)
    : sectionQuery;
};

/**
 * Formats section name by trimming whitespace and capitalizing the first letter.
 *
 * @param {string} name - The section name to format.
 * @returns {string} - The formatted section name.
 */
const formatSectionName = (name) => {
  return toCapitalize(name); // Step 1: Capitalize the section name
};

/**
 * Creates a new section object.
 *
 * @param {Object} params - The parameters to create the section object.
 * @param {string} params.name - The name of the section.
 * @param {string} params.classId - The class ID to associate with the section.
 * @returns {Object} - The newly created section object.
 */
const createSectionObj = async ({ name, classId }) => {
  const sectionCode = generateSectionCode(); // Step 1: Generate a unique section code

  // Step 2: Create and return the new section object
  return new Section({
    sectionCode,
    name,
    class: classId,
  });
};

/**
 * Updates an existing section in the database.
 *
 * @param {Object} params - The parameters for updating the section.
 * @param {string} params.sectionCode - The unique code of the section to update.
 * @param {string} params.name - The new name for the section.
 * @param {string} params.classId - The new class ID for the section.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated section object.
 */
const updateSectionObj = async ({ sectionCode, name, classId }) => {
  return await Section.findOneAndUpdate(
    { sectionCode }, // Step 1: Identify the section by sectionCode
    {
      name, // Step 2: Update the section name
      class: classId, // Step 3: Update the class association
      updatedAt: moment().valueOf(), // Step 4: Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a section from the database.
 *
 * @param {string} sectionCode - The unique code of the section to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteSectionObj = async (sectionCode) => {
  return await Section.deleteOne({ sectionCode }); // Step 1: Delete the section by sectionCode
};

module.exports = {
  findSections, // Export function to retrieve multiple sections
  findSection, // Export function to retrieve a single section
  formatSectionName, // Export function to format section name
  createSectionObj, // Export function to create a new section
  updateSectionObj, // Export function to update an existing section
  deleteSectionObj, // Export function to delete a section
};
