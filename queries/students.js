const moment = require("moment-timezone");
const Student = require("../models/student");
const {
  hiddenFieldsDefault,
  toCapitalize,
  generateStudentCode,
} = require("../utils/helpers");
const {
  buildStudentPipeline,
  buildStudentCountPipeline,
} = require("../pipelines/students");

/**
 * Retrieves all students from the database with pagination, filtering, sorting, and optional population of related data.
 *
 * @param {Object} params - The parameters for querying students.
 * @param {Object} [params.query={}] - The MongoDB query object to filter students.
 * @param {string} [params.keyword=""] - Search keyword for text-based filtering.
 * @param {string} [params.sortField="_id"] - Field name to sort by (default is '_id').
 * @param {string} [params.sortValue="desc"] - Sort order ('asc' or 'desc'), default is 'desc'.
 * @param {number} [params.page=1] - Page number for pagination (default is 1).
 * @param {number} [params.limit=10] - Number of records per page (default is 10).
 * @param {boolean} [params.populate=false] - Determines if related data should be populated.
 * @param {boolean} [params.projection=false] - Whether to apply field projection.
 * @param {boolean} [params.all=false] - Whether to query all without pagination.
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing:
 *   - results {Array}: The list of students matching the query.
 *   - totalCount {number}: The total number of matching students.
 */
const findStudents = async ({
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
  // Execute both the data retrieval and count queries concurrently using Promise.all for efficiency
  const [results, countResult] = await Promise.all([
    // Aggregate pipeline to fetch student records with filters, pagination, and optional population
    Student.aggregate(
      buildStudentPipeline({
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
    // Aggregate pipeline to get the total count of matching student records (ignores pagination)
    Student.aggregate(
      buildStudentCountPipeline({
        query,
        keyword,
      })
    ),
  ]);

  // Extract the total count from the aggregation result, defaulting to 0 if not present
  const totalCount = countResult[0]?.totalCount || 0;

  // Return the results along with the total count
  return { results, totalCount };
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

module.exports = {
  findStudents, // Export function to retrieve multiple students
  findStudent, // Export function to retrieve a single student
  formatStudentFields, // Export function to format student fields
  createStudentObj, // Export function to create a new student
  updateStudentObj, // Export function to update an existing student
  deleteStudentObj, // Export function to delete a student
};
