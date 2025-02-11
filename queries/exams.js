const moment = require("moment-timezone");
const Exam = require("../models/exam");
const {
  hiddenFieldsDefault,
  getLimitAndSkip,
  generateExamCode,
} = require("../utils/helpers");

/**
 * Retrieves all exams from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying exams.
 * @param {Object} params.query - The MongoDB query object to filter exams.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @returns {Promise<Array>} - A promise that resolves to an array of exams.
 */
const findExams = async ({
  query = {}, // MongoDB query object to filter exams
  options = false, // Fields to include/exclude in the result
  start = 1, // Starting index for pagination (default is 1)
  end = 10, // Ending index for pagination (default is 10)
}) => {
  // Step 1: Calculate the limit and skip values for pagination
  const { limit, skip } = getLimitAndSkip(start, end);

  // Step 2: Query the database with provided filters, apply pagination (skip & limit)
  return await Exam.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip) // Apply skip for pagination
    .limit(limit); // Apply limit to control number of results
};

/**
 * Retrieves a single exam from the database.
 *
 * @param {Object} params - The parameters for querying an exam.
 * @param {Object} params.query - The MongoDB query object to filter the exam.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @returns {Promise<Object|null>} - A promise that resolves to the exam object or null if not found.
 */
const findExam = async ({
  query = {}, // MongoDB query object to filter the exam
  options = false, // Fields to include/exclude in the result
}) => {
  // Step 1: Query the database to find a single exam based on the query criteria
  return await Exam.findOne(query, options ? hiddenFieldsDefault : {});
};

/**
 * Formats an exam title by trimming whitespace and converting it to uppercase.
 *
 * @param {string} title - The exam title to format.
 * @returns {string} - The formatted exam title.
 */
const formatExamTitle = (title) => {
  // Step 1: Trim whitespace and convert the title to uppercase
  return title.trim().toUpperCase();
};

/**
 * Creates a new exam object.
 *
 * @param {Object} params - The parameters to create the exam object.
 * @param {string} params.title - The title of the exam.
 * @returns {Object} - The newly created exam object.
 */
const createExamObj = async ({ title }) => {
  // Step 1: Generate a unique exam code
  const examCode = generateExamCode();

  // Step 2: Create a new Exam object with the generated code and provided title
  return new Exam({
    examCode,
    title,
  });
};

/**
 * Updates an existing exam in the database.
 *
 * @param {Object} params - The parameters for updating the exam.
 * @param {string} params.examCode - The unique code of the exam to update.
 * @param {string} params.title - The new title for the exam.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated exam object.
 */
const updateExamObj = async ({ examCode, title }) => {
  // Step 1: Update the exam document with the provided examCode
  return await Exam.findOneAndUpdate(
    { examCode }, // Query to find the exam by examCode
    {
      title, // Update the exam title
      updatedAt: moment().valueOf(), // Set the current timestamp for the update
    }
  );
};

/**
 * Deletes an exam from the database.
 *
 * @param {string} examCode - The unique code of the exam to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteExamObj = async (examCode) => {
  // Step 1: Delete the exam document with the provided examCode
  return await Exam.deleteOne({ examCode });
};

module.exports = {
  findExams, // Export function to retrieve multiple exams
  findExam, // Export function to retrieve a single exam
  formatExamTitle, // Export function to format exam titles
  createExamObj, // Export function to create a new exam object
  updateExamObj, // Export function to update an existing exam
  deleteExamObj, // Export function to delete an exam
};
