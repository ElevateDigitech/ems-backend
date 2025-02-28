const allPermissions = {
  VIEW_PERMISSIONS: "VIEW PERMISSIONS",
  VIEW_AUDITS: "VIEW AUDITS",
  VIEW_ROLES: "VIEW ROLES",
  VIEW_OWN_ROLE_ONLY: "VIEW OWN ROLE ONLY",
  CREATE_ROLE: "CREATE ROLE",
  UPDATE_ROLE: "UPDATE ROLE",
  DELETE_ROLE: "DELETE ROLE",
  VIEW_USERS: "VIEW USERS",
  VIEW_OWN_USER_ONLY: "VIEW OWN USER ONLY",
  CREATE_USER: "CREATE USER",
  UPDATE_USER: "UPDATE USER",
  DELETE_USER: "DELETE USER",
  CHANGE_PASSWORDS: "CHANGE PASSWORDS",
  CHANGE_OWN_PASSWORD: "CHANGE OWN PASSWORD",
  VIEW_PROFILES: "VIEW PROFILES",
  VIEW_OWN_PROFILE_ONLY: "VIEW OWN PROFILE ONLY",
  CREATE_PROFILE: "CREATE PROFILE",
  UPDATE_PROFILE: "UPDATE PROFILE",
  DELETE_PROFILE: "DELETE PROFILE",
  VIEW_GENDERS: "VIEW GENDERS",
  CREATE_GENDER: "CREATE GENDER",
  UPDATE_GENDER: "UPDATE GENDER",
  DELETE_GENDER: "DELETE GENDER",
  VIEW_COUNTRIES: "VIEW COUNTRIES",
  CREATE_COUNTRY: "CREATE COUNTRY",
  UPDATE_COUNTRY: "UPDATE COUNTRY",
  DELETE_COUNTRY: "DELETE COUNTRY",
  VIEW_STATES: "VIEW STATES",
  CREATE_STATE: "CREATE STATE",
  UPDATE_STATE: "UPDATE STATE",
  DELETE_STATE: "DELETE STATE",
  VIEW_CITIES: "VIEW CITIES",
  CREATE_CITY: "CREATE CITY",
  UPDATE_CITY: "UPDATE CITY",
  DELETE_CITY: "DELETE CITY",
  VIEW_CLASSES: "VIEW CLASSES",
  CREATE_CLASS: "CREATE CLASS",
  UPDATE_CLASS: "UPDATE CLASS",
  DELETE_CLASS: "DELETE CLASS",
  VIEW_SECTIONS: "VIEW SECTIONS",
  CREATE_SECTION: "CREATE SECTION",
  UPDATE_SECTION: "UPDATE SECTION",
  DELETE_SECTION: "DELETE SECTION",
  VIEW_SUBJECTS: "VIEW SUBJECTS",
  CREATE_SUBJECT: "CREATE SUBJECT",
  UPDATE_SUBJECT: "UPDATE SUBJECT",
  DELETE_SUBJECT: "DELETE SUBJECT",
  VIEW_STUDENTS: "VIEW STUDENTS",
  CREATE_STUDENT: "CREATE STUDENT",
  UPDATE_STUDENT: "UPDATE STUDENT",
  DELETE_STUDENT: "DELETE STUDENT",
  VIEW_QUESTIONS: "VIEW QUESTIONS",
  CREATE_QUESTION: "CREATE QUESTION",
  UPDATE_QUESTION: "UPDATE QUESTION",
  DELETE_QUESTION: "DELETE QUESTION",
  VIEW_EXAMS: "VIEW EXAMS",
  CREATE_EXAM: "CREATE EXAM",
  UPDATE_EXAM: "UPDATE EXAM",
  DELETE_EXAM: "DELETE EXAM",
  VIEW_MARKS: "VIEW MARKS",
  CREATE_MARK: "CREATE MARK",
  UPDATE_MARK: "UPDATE MARK",
  DELETE_MARK: "DELETE MARK",
};

const basePermissions = [
  {
    permissionName: allPermissions?.VIEW_PERMISSIONS,
    permissionDescription: "can view permissions",
  },
  {
    permissionName: allPermissions?.VIEW_ROLES,
    permissionDescription: "can view roles",
  },
  {
    permissionName: allPermissions?.VIEW_OWN_ROLE_ONLY,
    permissionDescription: "only view own role",
  },
  {
    permissionName: allPermissions?.CREATE_ROLE,
    permissionDescription: "can create role",
  },
  {
    permissionName: allPermissions?.UPDATE_ROLE,
    permissionDescription: "can modify role",
  },
  {
    permissionName: allPermissions?.DELETE_ROLE,
    permissionDescription: "can delete role",
  },
  {
    permissionName: allPermissions?.VIEW_USERS,
    permissionDescription: "can view users",
  },
  {
    permissionName: allPermissions?.VIEW_OWN_USER_ONLY,
    permissionDescription: "only view own user",
  },
  {
    permissionName: allPermissions?.CREATE_USER,
    permissionDescription: "can create user",
  },
  {
    permissionName: allPermissions?.UPDATE_USER,
    permissionDescription: "can modify user",
  },
  {
    permissionName: allPermissions?.DELETE_USER,
    permissionDescription: "can delete user",
  },
  {
    permissionName: allPermissions?.CHANGE_PASSWORDS,
    permissionDescription: "can change passwords",
  },
  {
    permissionName: allPermissions?.CHANGE_OWN_PASSWORD,
    permissionDescription: "can only change own password",
  },
  {
    permissionName: allPermissions?.VIEW_PROFILES,
    permissionDescription: "can view profiles",
  },
  {
    permissionName: allPermissions?.VIEW_OWN_PROFILE_ONLY,
    permissionDescription: "only view own profile",
  },
  {
    permissionName: allPermissions?.CREATE_PROFILE,
    permissionDescription: "can create profile",
  },
  {
    permissionName: allPermissions?.UPDATE_PROFILE,
    permissionDescription: "can modily profile",
  },
  {
    permissionName: allPermissions?.DELETE_PROFILE,
    permissionDescription: "can delete profile",
  },
  {
    permissionName: allPermissions?.VIEW_GENDERS,
    permissionDescription: "can view gender",
  },
  {
    permissionName: allPermissions?.CREATE_GENDER,
    permissionDescription: "can create gender",
  },
  {
    permissionName: allPermissions?.UPDATE_GENDER,
    permissionDescription: "can modify gender",
  },
  {
    permissionName: allPermissions?.DELETE_GENDER,
    permissionDescription: "can delete gender",
  },
  {
    permissionName: allPermissions?.VIEW_COUNTRIES,
    permissionDescription: "can view country",
  },
  {
    permissionName: allPermissions?.CREATE_COUNTRY,
    permissionDescription: "can create country",
  },
  {
    permissionName: allPermissions?.UPDATE_COUNTRY,
    permissionDescription: "can modify country",
  },
  {
    permissionName: allPermissions?.DELETE_COUNTRY,
    permissionDescription: "can modify country",
  },
  {
    permissionName: allPermissions?.VIEW_STATES,
    permissionDescription: "can view states",
  },
  {
    permissionName: allPermissions?.CREATE_STATE,
    permissionDescription: "can create state",
  },
  {
    permissionName: allPermissions?.UPDATE_STATE,
    permissionDescription: "can modify state",
  },
  {
    permissionName: allPermissions?.DELETE_STATE,
    permissionDescription: "can delete state",
  },
  {
    permissionName: allPermissions?.VIEW_CITIES,
    permissionDescription: "can view cities",
  },
  {
    permissionName: allPermissions?.CREATE_CITY,
    permissionDescription: "can create city",
  },
  {
    permissionName: allPermissions?.UPDATE_CITY,
    permissionDescription: "can update city",
  },
  {
    permissionName: allPermissions?.DELETE_CITY,
    permissionDescription: "can delete city",
  },
  {
    permissionName: allPermissions?.VIEW_AUDITS,
    permissionDescription: "can view log entries",
  },
  {
    permissionName: allPermissions?.VIEW_CLASSES,
    permissionDescription: "can view classes",
  },
  {
    permissionName: allPermissions?.CREATE_CLASS,
    permissionDescription: "can create class",
  },
  {
    permissionName: allPermissions?.UPDATE_CLASS,
    permissionDescription: "can update class",
  },
  {
    permissionName: allPermissions?.DELETE_CLASS,
    permissionDescription: "can delete class",
  },
  {
    permissionName: allPermissions?.VIEW_SECTIONS,
    permissionDescription: "can view sections",
  },
  {
    permissionName: allPermissions?.CREATE_SECTION,
    permissionDescription: "can create section",
  },
  {
    permissionName: allPermissions?.UPDATE_SECTION,
    permissionDescription: "can update section",
  },
  {
    permissionName: allPermissions?.DELETE_SECTION,
    permissionDescription: "can delete section",
  },
  {
    permissionName: allPermissions?.VIEW_SUBJECTS,
    permissionDescription: "can view subjects",
  },
  {
    permissionName: allPermissions?.CREATE_SUBJECT,
    permissionDescription: "can create subject",
  },
  {
    permissionName: allPermissions?.UPDATE_SUBJECT,
    permissionDescription: "can update subject",
  },
  {
    permissionName: allPermissions?.DELETE_SUBJECT,
    permissionDescription: "can delete subject",
  },
  {
    permissionName: allPermissions?.VIEW_STUDENTS,
    permissionDescription: "can view students",
  },
  {
    permissionName: allPermissions?.CREATE_STUDENT,
    permissionDescription: "can create student",
  },
  {
    permissionName: allPermissions?.UPDATE_STUDENT,
    permissionDescription: "can update student",
  },
  {
    permissionName: allPermissions?.DELETE_STUDENT,
    permissionDescription: "can delete student",
  },
  {
    permissionName: allPermissions?.VIEW_QUESTIONS,
    permissionDescription: "can view questions",
  },
  {
    permissionName: allPermissions?.CREATE_QUESTION,
    permissionDescription: "can create question",
  },
  {
    permissionName: allPermissions?.UPDATE_QUESTION,
    permissionDescription: "can update question",
  },
  {
    permissionName: allPermissions?.DELETE_QUESTION,
    permissionDescription: "can delete question",
  },
  {
    permissionName: allPermissions?.VIEW_EXAMS,
    permissionDescription: "can view exams",
  },
  {
    permissionName: allPermissions?.CREATE_EXAM,
    permissionDescription: "can create exam",
  },
  {
    permissionName: allPermissions?.UPDATE_EXAM,
    permissionDescription: "can update exam",
  },
  {
    permissionName: allPermissions?.DELETE_EXAM,
    permissionDescription: "can delete exam",
  },
  {
    permissionName: allPermissions?.VIEW_MARKS,
    permissionDescription: "can view marks",
  },
  {
    permissionName: allPermissions?.CREATE_MARK,
    permissionDescription: "can create mark",
  },
  {
    permissionName: allPermissions?.UPDATE_MARK,
    permissionDescription: "can update mark",
  },
  {
    permissionName: allPermissions?.DELETE_MARK,
    permissionDescription: "can delete mark",
  },
];

module.exports = { basePermissions, allPermissions };
