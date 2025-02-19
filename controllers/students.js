const { logAudit } = require("../queries/auditLogs");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  handleError,
  handleSuccess,
  IsObjectIdReferenced,
  getCurrentUser,
} = require("../utils/helpers");
const {
  STATUS_CODE_CONFLICT,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_INTERNAL_SERVER_ERROR,
} = require("../utils/statusCodes");
const {
  MESSAGE_SECTION_NOT_FOUND,
  MESSAGE_STUDENTS_NOT_FOUND,
  MESSAGE_STUDENT_NOT_FOUND,
  MESSAGE_GET_STUDENTS_SUCCESS,
  MESSAGE_GET_STUDENT_SUCCESS,
  MESSAGE_STUDENT_EXIST,
  MESSAGE_CREATE_STUDENT_SUCCESS,
  MESSAGE_STUDENT_TAKEN,
  MESSAGE_UPDATE_STUDENT_SUCCESS,
  MESSAGE_STUDENT_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_STUDENT_ERROR,
  MESSAGE_DELETE_STUDENT_SUCCESS,
} = require("../utils/messages");
const {
  findStudent,
  findStudents,
  formatStudentFields,
  createStudentObj,
  updateStudentObj,
  deleteStudentObj,
} = require("../queries/students");
const { findSection } = require("../queries/sections");

module.exports = {
  /**
   * Retrieves all students from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetStudents: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const { results, totalCount } = await findStudents({
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });
    // Step 3: Send success response with the list of students
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_STUDENTS_SUCCESS,
          results,
          totalCount
        )
      );
  },

  /**
   * Retrieves a specific student by its code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetStudentByCode: async (req, res, next) => {
    const { studentCode } = req.body; // Step 1: Extract student code from request body

    // Step 2: Find the student by its code
    const student = await findStudent({
      query: { studentCode },
      options: true,
    });

    // Step 3: Handle case when student is not found
    if (!student)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STUDENT_NOT_FOUND
      );

    // Step 4: Send success response with the found student
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_GET_STUDENT_SUCCESS, student)
      );
  },

  /**
   * Retrieves students by the associated section code.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  GetStudentsBySectionCode: async (req, res, next) => {
    const {
      keyword = "",
      sortField = "_id",
      sortValue = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const { sectionCode } = req.body; // Step 2: Extract section code from request body

    // Step 3: Find the section by its code
    const section = await findSection({ query: { sectionCode } });

    // Step 4: Handle case when section is not found
    if (!section)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTION_NOT_FOUND
      );

    const { results, totalCount } = await findStudents({
      query: { section: section._id },
      keyword,
      sortField,
      sortValue,
      page,
      limit,
      populate: true,
      projection: true,
    });

    // Step 6: Handle case when no students are found
    if (!results?.length)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STUDENTS_NOT_FOUND
      );
    // Step 7: Send success response with the list of students
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_STUDENT_SUCCESS,
          results,
          totalCount
        )
      );
  },

  /**
   * Creates a new student in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  CreateStudent: async (req, res, next) => {
    const { name, rollNumber, sectionCode } = req.body; // Step 1: Extract student details from request body
    const { formattedName, formattedRollNumber } = formatStudentFields({
      name,
      rollNumber,
    }); // Step 2: Format student fields

    // Step 3: Check if the student already exists
    const existingStudent = await findStudent({
      query: { rollNumber: formattedRollNumber },
    });
    if (existingStudent)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_EXIST);

    // Step 4: Verify if the provided section exists
    const existingSection = await findSection({ query: { sectionCode } });
    if (!existingSection)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    // Step 5: Create a new student document
    const newStudent = await createStudentObj({
      name: formattedName,
      rollNumber: formattedRollNumber,
      section: existingSection._id,
    });
    await newStudent.save();

    // Step 6: Retrieve the newly created student
    const createdStudent = await findStudent({
      query: { studentCode: newStudent.studentCode },
      options: true,
      populated: true,
    });

    // Step 7: Log the creation action for auditing
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.CREATE,
      auditCollections.STUDENTS,
      createdStudent.studentCode,
      auditChanges.CREATE_STUDENT,
      null,
      createdStudent.toObject(),
      currentUser.toObject()
    );

    // Step 8: Send success response with the created student
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_CREATE_STUDENT_SUCCESS,
          createdStudent
        )
      );
  },

  /**
   * Updates an existing student's details in the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  UpdateStudent: async (req, res, next) => {
    const { studentCode, name, rollNumber, sectionCode } = req.body; // Step 1: Extract student details from request body
    const { formattedName, formattedRollNumber } = formatStudentFields({
      name,
      rollNumber,
    }); // Step 2: Format student fields

    // Step 3: Verify if the student exists
    const existingStudent = await findStudent({ query: { studentCode } });
    if (!existingStudent)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_NOT_FOUND);

    // Step 4: Verify if the provided section exists
    const existingSection = await findSection({ query: { sectionCode } });
    if (!existingSection)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    // Step 5: Check for duplicate student details
    const duplicateStudent = await findStudent({
      query: {
        studentCode: { $ne: studentCode },
        rollNumber: formattedRollNumber,
      },
    });
    if (duplicateStudent)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_TAKEN);

    // Step 6: Retrieve student before updating (for audit)
    const previousData = await findStudent({
      query: { studentCode },
      options: true,
      populated: true,
    });

    // Step 7: Update student details
    await updateStudentObj({
      studentCode,
      name: formattedName,
      rollNumber: formattedRollNumber,
      section: existingSection._id,
    });

    // Step 8: Retrieve updated student
    const updatedStudent = await findStudent({
      query: { studentCode },
      options: true,
      populated: true,
    });

    // Step 9: Log the update action for auditing
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.UPDATE,
      auditCollections.STUDENTS,
      updatedStudent.studentCode,
      auditChanges.UPDATE_STUDENT,
      previousData.toObject(),
      updatedStudent.toObject(),
      currentUser.toObject()
    );

    // Step 10: Send success response with the updated student
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_UPDATE_STUDENT_SUCCESS,
          updatedStudent
        )
      );
  },

  /**
   * Deletes a student from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  DeleteStudent: async (req, res, next) => {
    const { studentCode } = req.body; // Step 1: Extract student code from request body

    // Step 2: Verify if the student exists
    const existingStudent = await findStudent({ query: { studentCode } });
    if (!existingStudent)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_NOT_FOUND);

    // Step 3: Check if the student is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingStudent._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STUDENT_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Step 4: Retrieve student before deletion (for audit)
    const previousData = await findStudent({
      query: { studentCode },
      options: true,
      populated: true,
    });

    // Step 5: Delete the student
    const deleteResult = await deleteStudentObj(studentCode);
    if (!deleteResult?.deletedCount)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_STUDENT_ERROR
      );

    // Step 6: Log the deletion action for auditing
    const currentUser = await getCurrentUser(req.user.userCode);
    await logAudit(
      auditActions.DELETE,
      auditCollections.STUDENTS,
      previousData.studentCode,
      auditChanges.DELETE_STUDENT,
      previousData.toObject(),
      null,
      currentUser.toObject()
    );

    // Step 7: Send success response confirming deletion
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_STUDENT_SUCCESS));
  },
};
