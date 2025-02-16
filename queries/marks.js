const moment = require("moment-timezone");
const Mark = require("../models/mark");
const {
  hiddenFieldsDefault,
  getLimitAndSkip,
  generateMarkCode,
} = require("../utils/helpers");

/**
 * Retrieves all marks from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying marks.
 * @param {Object} params.query - The MongoDB query object to filter marks.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Array>} - A promise that resolves to an array of marks.
 */
const findMarks = async ({
  query = {},
  options = false,
  page = 1,
  perPage = 10,
  populated = false,
}) => {
  // Step 1: Calculate pagination parameters
  const { limit, skip } = getLimitAndSkip(page, perPage);

  // Step 2: Build the base query to find marks
  const marksQuery = Mark.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip)
    .limit(limit);

  // Step 3: Conditionally populate related exam, student, and subject data if populated flag is true
  return populated
    ? marksQuery
        .populate("exam", hiddenFieldsDefault)
        .populate({
          path: "student",
          select: hiddenFieldsDefault,
          populate: {
            path: "section",
            select: hiddenFieldsDefault,
            populate: {
              path: "class",
              select: hiddenFieldsDefault,
            },
          },
        })
        .populate("subject", hiddenFieldsDefault)
    : marksQuery;
};

/**
 * Retrieves a single mark from the database.
 *
 * @param {Object} params - The parameters for querying a mark.
 * @param {Object} params.query - The MongoDB query object to filter the mark.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the mark object or null if not found.
 */
const findMark = async ({ query = {}, options = false, populated = false }) => {
  // Step 1: Build the base query to find a mark
  const markQuery = Mark.findOne(query, options ? hiddenFieldsDefault : {});

  // Step 2: Conditionally populate related exam, student, and subject data if populated flag is true
  return populated
    ? markQuery
        .populate("exam", hiddenFieldsDefault)
        .populate({
          path: "student",
          select: hiddenFieldsDefault,
          populate: {
            path: "section",
            select: hiddenFieldsDefault,
            populate: {
              path: "class",
              select: hiddenFieldsDefault,
            },
          },
        })
        .populate("subject", hiddenFieldsDefault)
    : markQuery;
};

/**
 * Creates a new mark object.
 *
 * @param {Object} params - The parameters to create the mark object.
 * @param {number} params.markEarned - The marks earned by the student.
 * @param {number} params.markTotal - The total marks possible.
 * @param {string} params.exam - The associated exam ID.
 * @param {string} params.student - The associated student ID.
 * @param {string} params.subject - The associated subject ID.
 * @returns {Object} - The newly created mark object.
 */
const createMarkObj = async ({
  markEarned,
  markTotal,
  exam,
  student,
  subject,
}) => {
  // Step 1: Generate a unique mark code
  const markCode = generateMarkCode();

  // Step 2: Create and return the new mark object
  return new Mark({
    markCode,
    markEarned,
    markTotal,
    exam,
    student,
    subject,
  });
};

/**
 * Updates an existing mark in the database.
 *
 * @param {Object} params - The parameters for updating the mark.
 * @param {string} params.markCode - The unique code of the mark to update.
 * @param {number} params.markEarned - The new marks earned.
 * @param {number} params.markTotal - The new total marks possible.
 * @param {string} params.exam - The new associated exam ID.
 * @param {string} params.student - The new associated student ID.
 * @param {string} params.subject - The new associated subject ID.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated mark object.
 */
const updateMarkObj = async ({
  markCode,
  markEarned,
  markTotal,
  exam,
  student,
  subject,
}) => {
  // Step 1: Identify the mark by its code and update the fields
  return await Mark.findOneAndUpdate(
    { markCode },
    {
      markEarned,
      markTotal,
      exam,
      student,
      subject,
      updatedAt: moment().valueOf(), // Step 2: Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a mark from the database.
 *
 * @param {string} markCode - The unique code of the mark to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteMarkObj = async (markCode) => {
  // Step 1: Delete the mark document by markCode
  return await Mark.deleteOne({ markCode });
};

const getMarkPaginationObject = async (page, perPage) => ({
  page,
  perPage,
  total: await Mark.countDocuments(),
});

module.exports = {
  findMarks, // Export function to retrieve multiple marks
  findMark, // Export function to retrieve a single mark
  createMarkObj, // Export function to create a new mark
  updateMarkObj, // Export function to update an existing mark
  deleteMarkObj, // Export function to delete a mark
  getMarkPaginationObject,
};
