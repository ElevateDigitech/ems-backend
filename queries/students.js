const moment = require("moment-timezone");
const Student = require("../models/student");
const {
  hiddenFieldsDefault,
  getLimitAndSkip,
  toCapitalize,
  generateStudentCode,
} = require("../utils/helpers");

/**
 * Retrieves all students from the database with pagination support.
 *
 * @param {Object} params - The parameters for querying students.
 * @param {Object} params.query - The MongoDB query object to filter students.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {number} params.start - The starting index for pagination (default is 1).
 * @param {number} params.end - The ending index for pagination (default is 10).
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Array>} - A promise that resolves to an array of students.
 */
const findStudents = async ({
  query = {},
  options = false,
  page = 1,
  perPage = 10,
  populated = false,
}) => {
  const { limit, skip } = getLimitAndSkip(page, perPage); // Step 1: Calculate pagination parameters

  // Step 2: Build the base query to find students
  const studentsQuery = Student.find(query, options ? hiddenFieldsDefault : {})
    .skip(skip)
    .limit(limit);

  // Step 3: Conditionally populate related section and class data if populated flag is true
  return populated
    ? studentsQuery.populate({
        path: "section",
        select: hiddenFieldsDefault,
        populate: {
          path: "class",
          select: hiddenFieldsDefault,
        },
      })
    : studentsQuery;
};

/**
 * Retrieves a single student from the database.
 *
 * @param {Object} params - The parameters for querying a student.
 * @param {Object} params.query - The MongoDB query object to filter the student.
 * @param {Object} params.options - Fields to include or exclude from the result.
 * @param {boolean} params.populated - Determines if related data should be populated.
 * @returns {Promise<Object|null>} - A promise that resolves to the student object or null if not found.
 */
const findStudent = async ({
  query = {},
  options = false,
  populated = false,
}) => {
  const studentQuery = Student.findOne(
    query,
    options ? hiddenFieldsDefault : {}
  ); // Step 1: Build the base query to find a student

  // Step 2: Conditionally populate related section and class data if populated flag is true
  return populated
    ? studentQuery.populate({
        path: "section",
        select: hiddenFieldsDefault,
        populate: {
          path: "class",
          select: hiddenFieldsDefault,
        },
      })
    : studentQuery;
};

/**
 * Formats student fields by capitalizing the name and converting roll number to uppercase.
 *
 * @param {Object} params - The student details to format.
 * @param {string} params.name - The student name to format.
 * @param {string} params.rollNumber - The roll number to format.
 * @returns {Object} - The formatted student details.
 */
const formatStudentFields = ({ name, rollNumber }) => {
  return {
    formattedName: toCapitalize(name), // Step 1: Capitalize the student name
    formattedRollNumber: rollNumber.toUpperCase(), // Step 2: Convert roll number to uppercase
  };
};

/**
 * Creates a new student object.
 *
 * @param {Object} params - The parameters to create the student object.
 * @param {string} params.name - The name of the student.
 * @param {string} params.rollNumber - The roll number of the student.
 * @param {string} params.section - The associated section ID.
 * @returns {Object} - The newly created student object.
 */
const createStudentObj = async ({ name, rollNumber, section }) => {
  const studentCode = generateStudentCode(); // Step 1: Generate a unique student code

  // Step 2: Create and return the new student object
  return new Student({
    studentCode,
    name,
    rollNumber,
    section,
  });
};

/**
 * Updates an existing student in the database.
 *
 * @param {Object} params - The parameters for updating the student.
 * @param {string} params.studentCode - The unique code of the student to update.
 * @param {string} params.name - The new name for the student.
 * @param {string} params.rollNumber - The new roll number for the student.
 * @param {string} params.section - The new associated section ID.
 * @returns {Promise<Object|null>} - A promise that resolves to the updated student object.
 */
const updateStudentObj = async ({ studentCode, name, rollNumber, section }) => {
  return await Student.findOneAndUpdate(
    { studentCode }, // Step 1: Identify the student by their code
    {
      name, // Step 2: Update student name
      rollNumber, // Step 3: Update roll number
      section, // Step 4: Update section
      updatedAt: moment().valueOf(), // Step 5: Set the current timestamp for the update
    }
  );
};

/**
 * Deletes a student from the database.
 *
 * @param {string} studentCode - The unique code of the student to delete.
 * @returns {Promise<Object>} - A promise that resolves to the deletion result.
 */
const deleteStudentObj = async (studentCode) => {
  return await Student.deleteOne({ studentCode }); // Step 1: Delete the student document by studentCode
};

const getStudentPaginationObject = async (page, perPage) => ({
  page,
  perPage,
  total: await Student.countDocuments(),
});

module.exports = {
  findStudents, // Export function to retrieve multiple students
  findStudent, // Export function to retrieve a single student
  formatStudentFields, // Export function to format student fields
  createStudentObj, // Export function to create a new student
  updateStudentObj, // Export function to update an existing student
  deleteStudentObj, // Export function to delete a student
  getStudentPaginationObject,
};
