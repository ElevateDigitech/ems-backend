const moment = require("moment-timezone");
const Section = require("../models/section");
const Student = require("../models/student");
const User = require("../models/user");
const { logAudit } = require("../middleware");
const {
  auditActions,
  auditCollections,
  auditChanges,
} = require("../utils/audit");
const {
  hiddenFieldsDefault,
  hiddenFieldsUser,
  handleError,
  handleSuccess,
  toCapitalize,
  IsObjectIdReferenced,
  generateStudentCode,
  generateAuditCode,
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

const findUser = async (userCode) =>
  // Find a user by userCode
  await User.findOne({ userCode }, hiddenFieldsUser)
    // Populate the role information for the user
    .populate({
      path: "role",
      select: hiddenFieldsDefault,
      // Populate the rolePermissions associated with the role
      populate: {
        path: "rolePermissions",
        select: hiddenFieldsDefault,
      },
    });

const findStudent = async (criteria) =>
  // Find a single student matching the provided criteria
  await Student.findOne(criteria, hiddenFieldsDefault)
    // Populate the associated section information for the student
    .populate({
      path: "section",
      select: hiddenFieldsDefault,
      // Populate the class associated with the section
      populate: {
        path: "class",
        select: hiddenFieldsDefault,
      },
    });

const findStudents = async (criteria = {}, limit) =>
  // Find all students that match the provided criteria (or all if none specified)
  await Student.find(criteria, hiddenFieldsDefault)
    // Populate the associated section information for each student
    .populate("section", hiddenFieldsDefault)
    .limit(limit);

module.exports = {
  /**
   * Retrieves all students from the database.
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  GetStudents: async (req, res) => {
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Retrieve all students from the database
    const students = await findStudents({}, entries);

    // Send success response with the list of students
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_STUDENTS_SUCCESS,
          students
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
    // Extract student code from request body
    const { studentCode } = req.body;

    // Find the student by its code
    const student = await findStudent({ studentCode });

    // Handle case when student is not found
    if (!student)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STUDENT_NOT_FOUND
      );

    // Send success response with the found student
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
    // Destructure 'entries' from the query parameters, defaulting to 100 if not provided
    const { entries = 100 } = req.query;
    // Extract section code from request body
    const { sectionCode } = req.body;

    // Find the section by its code
    const section = await Section.findOne({ sectionCode });

    // Handle case when section is not found
    if (!section)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_SECTION_NOT_FOUND
      );

    // Retrieve sections associated with the section
    const sections = await findStudents({ section: section._id }, entries);

    // Handle case when no sections are found
    if (!sections?.length)
      return handleError(
        next,
        STATUS_CODE_BAD_REQUEST,
        MESSAGE_STUDENTS_NOT_FOUND
      );

    // Send success response with the list of sections
    res
      .status(STATUS_CODE_SUCCESS)
      .send(
        handleSuccess(
          STATUS_CODE_SUCCESS,
          MESSAGE_GET_STUDENT_SUCCESS,
          sections
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
    // Extract student details from request body
    const { name, rollNumber, sectionCode } = req.body;

    // Check if the student already exists
    const existingStudent = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });
    if (existingStudent)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_EXIST);

    // Verify if the provided section exists
    const existingSection = await Section.findOne({ sectionCode });
    if (!existingSection)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    // Generate unique code for the new student
    const studentCode = generateStudentCode();

    // Create a new student document
    const newStudent = new Student({
      studentCode,
      name: toCapitalize(name),
      rollNumber: rollNumber.toUpperCase(),
      section: existingSection._id,
    });
    await newStudent.save();

    // Retrieve the newly created student
    const createdStudent = await findStudent({ studentCode });

    // Log the creation action for auditing
    const currentUser = await findUser(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.CREATE,
      auditCollections.STUDENTS,
      createdStudent.studentCode,
      auditChanges.CREATE_STUDENT,
      null,
      createdStudent.toObject(),
      currentUser.toObject()
    );

    // Send success response with the created student
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
    // Extract student details from request body
    const { studentCode, name, rollNumber, sectionCode } = req.body;

    // Verify if the student exists
    const existingStudent = await Student.findOne({ studentCode });
    if (!existingStudent)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_NOT_FOUND);

    // Verify if the provided section exists
    const existingSection = await Section.findOne({ sectionCode });
    if (!existingSection)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_SECTION_NOT_FOUND);

    // Check for duplicate student details
    const otherStudents = await Student.find({
      studentCode: { $ne: studentCode },
      rollNumber: rollNumber.toUpperCase(),
    });
    if (otherStudents?.length)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_TAKEN);

    // Retrieve student before updating (for audit)
    const studentBeforeUpdate = await findStudent({ studentCode });

    // Update student details
    await Student.findOneAndUpdate(
      { studentCode },
      {
        name: toCapitalize(name),
        rollNumber: rollNumber.toUpperCase(),
        section: existingSection._id,
        updatedAt: moment().valueOf(),
      }
    );

    // Retrieve updated student
    const updatedStudent = await findStudent({ studentCode });

    // Log the update action for auditing
    const currentUser = await findUser(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.UPDATE,
      auditCollections.STUDENTS,
      updatedStudent.studentCode,
      auditChanges.UPDATE_STUDENT,
      studentBeforeUpdate.toObject(),
      updatedStudent.toObject(),
      currentUser.toObject()
    );

    // Send success response with the updated student
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
    // Extract student code from request body
    const { studentCode } = req.body;

    // Verify if the student exists
    const existingStudent = await Student.findOne({ studentCode });
    if (!existingStudent)
      return handleError(next, STATUS_CODE_CONFLICT, MESSAGE_STUDENT_NOT_FOUND);

    // Check if the student is referenced elsewhere
    const { isReferenced } = await IsObjectIdReferenced(existingStudent._id);
    if (isReferenced)
      return handleError(
        next,
        STATUS_CODE_CONFLICT,
        MESSAGE_STUDENT_NOT_ALLOWED_DELETE_REFERENCE_EXIST
      );

    // Retrieve student before deletion (for audit)
    const studentBeforeDelete = await findStudent({ studentCode });

    // Delete the student
    const deleteResult = await Student.deleteOne({ studentCode });
    if (!deleteResult?.deletedCount)
      return handleError(
        next,
        STATUS_CODE_INTERNAL_SERVER_ERROR,
        MESSAGE_DELETE_STUDENT_ERROR
      );

    // Log the deletion action for auditing
    const currentUser = await findUser(req.user.userCode);
    await logAudit(
      generateAuditCode(),
      auditActions.DELETE,
      auditCollections.STUDENTS,
      studentBeforeDelete.studentCode,
      auditChanges.DELETE_STUDENT,
      studentBeforeDelete.toObject(),
      null,
      currentUser.toObject()
    );

    // Send success response confirming deletion
    res
      .status(STATUS_CODE_SUCCESS)
      .send(handleSuccess(STATUS_CODE_SUCCESS, MESSAGE_DELETE_STUDENT_SUCCESS));
  },
};
