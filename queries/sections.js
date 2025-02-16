const moment = require("moment-timezone");
const Section = require("../models/section");
const {
  hiddenFieldsDefault,
  getLimitAndSkip,
  toCapitalize,
  generateSectionCode,
} = require("../utils/helpers");

/**
 * Retrieves all sections from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying sections.
 * @param {Object} params.query - The MongoDB query object to filter sections.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Array>} - A promise that resolves to an array of sections.
 */
const findSections = async ({
  query = {},
  options = false,
  page = 1,
  perPage = 10,
  populated = false,
}) => {
  const { limit, skip } = getLimitAndSkip(page, perPage); // Step 1: Calculate pagination parameters

  // Step 2: Build the base query
  const sectionsQuery = Section.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip)
    .limit(limit);

  // Step 3: Conditionally populate related data
  return populated
    ? sectionsQuery.populate("class", hiddenFieldsDefault)
    : sectionsQuery;
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

const getSectionPaginationObject = async (page, perPage) => ({
  page,
  perPage,
  total: await Section.countDocuments(),
});

module.exports = {
  findSections, // Export function to retrieve multiple sections
  findSection, // Export function to retrieve a single section
  formatSectionName, // Export function to format section name
  createSectionObj, // Export function to create a new section
  updateSectionObj, // Export function to update an existing section
  deleteSectionObj, // Export function to delete a section
  getSectionPaginationObject,
};
