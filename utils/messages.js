const MESSAGE_ACCESS_DENIED_NO_ROLES = "Access denied. No role assigned.";
const MESSAGE_ACCESS_DENIED_NO_PERMISSION =
  "Access denied. Permission required.";

const MESSAGE_INTERNAL_SERVER_ERROR = "Internal server error";
const MESSAGE_PAGE_NOT_FOUND = "Page Not Found";

const MESSAGE_GET_PERMISSIONS_SUCCESS = "Permissions retrieved successfully";
const MESSAGE_GET_PERMISSION_SUCCESS = "Permission retrieved successfully";
const MESSAGE_PERMISSION_NOT_FOUND =
  "The selected permission could not be found";

const MESSAGE_GET_AUDITS_SUCCESS = "Countries retrieved successfully";
const MESSAGE_GET_AUDIT_SUCCESS = "Country retrieved successfully";
const MESSAGE_AUDIT_NOT_FOUND = "The log entry could not be found";

const MESSAGE_USER_REGISTER_SUCCESS = "User Registered Successfully";
const MESSAGE_UNAUTHENTICATED = "Authentication failed";
const MESSAGE_NOT_AUTHORIZED = "Unauthorized action";
const MESSAGE_NOT_LOGGED_IN_YET = "You must be signed in first!";
const MESSAGE_USER_LOGIN_SUCCESS = "User Logged in Successfully";
const MESSAGE_USER_LOGOUT_SUCCESS = "Logged out successfully";

const MESSAGE_MISSING_REQUIRED_FIELDS = "Missing one or more required fields";
const MESSAGE_INVALID_EMAIL_FORMAT = "Invalid email format";
const MESSAGE_PASSWORD_CONSTRAINTS_NOT_MET =
  "The password doesn't meet the required strength or length";
const MESSAGE_EMAIL_USERNAME_EXIST =
  "Username or email already taken. Please try a different one";
const MESSAGE_USER_NOT_FOUND = "User not found";
const MESSAGE_EMAIL_USERNAME_NOT_EXIST = "Username or email not registered";
const MESSAGE_OLD_PASSWORD_ERROR = "Old password incorrect";
const MESSAGE_PASSWORD_CHANGE_SUCCESS = "Password changed successfully";
const MESSAGE_USER_NOT_ALLOWED_DELETE =
  "The selected user is not allowed to be deleted";
const MESSAGE_USER_NOT_ALLOWED_DELETE_REFERENCE_EXIST =
  "The selected user is in use and not allowed to be deleted.";
const MESSAGE_UPDATE_USER_SUCCESS = "User updated successfully";
const MESSAGE_DELETE_USER_ERROR = "Couldn't delete the user";
const MESSAGE_DELETE_USER_SUCCESS = "User deleted successfully";
const MESSAGE_GET_USER_SUCCESS = "User retrieved successfully";
const MESSAGE_GET_USERS_SUCCESS = "Users retrieved successfully";

const MESSAGE_GET_ROLES_SUCCESS = "Roles retrieved successfully";
const MESSAGE_ROLE_NOT_FOUND = "The selected role could not be found";
const MESSAGE_GET_ROLE_SUCCESS = "Role retrieved successfully";
const MESSAGE_ROLE_EXIST = "Role already exist. Please try a different one";
const MESSAGE_ROLE_PERMISSION_NOT_FOUND =
  "One or more of the permissions listed are not valid";
const MESSAGE_CREATE_ROLE_SUCCESS = "Role created successfully";
const MESSAGE_UPDATE_ROLE_SUCCESS = "Role updated successfully";
const MESSAGE_ROLE_NOT_ALLOWED_DELETE =
  "The selected role is not allowed to be deleted";
const MESSAGE_ROLE_NOT_ALLOWED_DELETE_REFERENCE_EXIST =
  "The selected role is in use and not allowed to be deleted.";
const MESSAGE_DELETE_ROLE_ERROR = "Couldn't delete the role";
const MESSAGE_DELETE_ROLE_SUCCESS = "Role deleted successfully";
const MESSAGE_ROLE_TAKEN =
  "Role name already taken. Please try a different one.";

const MESSAGE_GET_GENDERS_SUCCESS = "Genders retrieved successfully";
const MESSAGE_GET_GENDER_SUCCESS = "Gender retrieved successfully";
const MESSAGE_GENDER_NOT_FOUND = "The selected gender could not be found";
const MESSAGE_GENDER_EXIST = "Gender already exist. Please try a different one";
const MESSAGE_CREATE_GENDERS_SUCCESS = "Gender created successfully";
const MESSAGE_UPDATE_GENDERS_SUCCESS = "Gender updated successfully";
const MESSAGE_DELETE_GENDERS_SUCCESS = "Gender deleted successfully";
const MESSAGE_DELETE_GENDERS_ERROR = "Couldn't delete the gender";
const MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST =
  "The selected gender is in use and not allowed to be deleted.";
const MESSAGE_GENDER_TAKEN =
  "Gander name already taken. Please try a different one.";

const MESSAGE_GET_COUNTRIES_SUCCESS = "Countries retrieved successfully";
const MESSAGE_GET_COUNTRY_SUCCESS = "Country retrieved successfully";
const MESSAGE_COUNTRY_EXIST =
  "Country already exist. Please try a different one";
const MESSAGE_CREATE_COUNTRY_SUCCESS = "Country created successfully";
const MESSAGE_COUNTRY_NOT_FOUND = "The selected country could not be found";
const MESSAGE_UPDATE_COUNTRY_SUCCESS = "Country updated successfully";
const MESSAGE_COUNTRY_NOT_ALLOWED_DELETE_REFERENCE_EXIST =
  "The selected country is in use and not allowed to be deleted.";
const MESSAGE_DELETE_COUNTRY_SUCCESS = "Country deleted successfully";
const MESSAGE_DELETE_COUNTRY_ERROR = "Couldn't delete the country";
const MESSAGE_COUNTRY_TAKEN =
  "Country name (or) iso2 (or) iso3 already taken. Please try a different one.";

const MESSAGE_GET_STATES_SUCCESS = "States retrieved successfully";
const MESSAGE_GET_STATE_SUCCESS = "State retrieved successfully";
const MESSAGE_STATE_EXIST = "State already exist. Please try a different one";
const MESSAGE_CREATE_STATE_SUCCESS = "State created successfully";
const MESSAGE_STATE_NOT_FOUND = "The selected state could not be found";
const MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY =
  "The selected state could not be found in the selected country";
const MESSAGE_STATES_NOT_FOUND =
  "There are no states available under the given country";
const MESSAGE_UPDATE_STATE_SUCCESS = "State updated successfully";
const MESSAGE_STATE_NOT_ALLOWED_DELETE_REFERENCE_EXIST =
  "The selected state is in use and not allowed to be deleted.";
const MESSAGE_DELETE_STATE_SUCCESS = "State deleted successfully";
const MESSAGE_DELETE_STATE_ERROR = "Couldn't delete the state";
const MESSAGE_STATE_TAKEN =
  "State name (or) iso already taken. Please try a different one.";

const MESSAGE_GET_CITIES_SUCCESS = "Cities retrieved successfully";
const MESSAGE_GET_CITY_SUCCESS = "City retrieved successfully";
const MESSAGE_CITY_EXIST = "City already exist. Please try a different one";
const MESSAGE_CREATE_CITY_SUCCESS = "City created successfully";
const MESSAGE_CITY_NOT_FOUND = "The selected city could not be found";
const MESSAGE_CITY_NOT_FOUND_UNDER_STATE =
  "The selected city could not be found in the selected state";
const MESSAGE_CITIES_NOT_FOUND =
  "There are no cities available under the given country";
const MESSAGE_UPDATE_CITY_SUCCESS = "City updated successfully";
const MESSAGE_CITY_NOT_ALLOWED_DELETE_REFERENCE_EXIST =
  "The selected city is in use and not allowed to be deleted.";
const MESSAGE_DELETE_CITY_SUCCESS = "City deleted successfully";
const MESSAGE_DELETE_CITY_ERROR = "Couldn't delete the city";
const MESSAGE_CITY_TAKEN =
  "City name already taken. Please try a different one.";

const MESSAGE_CREATE_PROFILE_SUCCESS = "Profile Created Successfully";
const MESSAGE_PROFILE_EXIST = "Profile already created";
const MESSAGE_GET_PROFILES_SUCCESS = "Profiles retrieved successfully";
const MESSAGE_GET_PROFILE_SUCCESS = "Profile retrieved successfully";
const MESSAGE_OWN_PROFILE_NOT_FOUND = "Profile is not created yet for you";
const MESSAGE_PROFILE_NOT_FOUND = "The selected profile could not be found";
const MESSAGE_PROFILE_NOT_FOUND_UNDER_USER =
  "There is no profile found under the selected user";
const MESSAGE_UPDATE_PROFILE_SUCCESS = "Profile Updated Successfully";
const MESSAGE_DELETE_PROFILE_SUCCESS = "Profile deleted successfully";
const MESSAGE_DELETE_PROFILE_ERROR = "Couldn't delete the profile";

const MESSAGE_GET_CLASSES_SUCCESS = "Classes retrieved successfully";
const MESSAGE_GET_CLASS_SUCCESS = "Class retrieved successfully";
const MESSAGE_CLASS_NOT_FOUND = "The selected class could not be found";
const MESSAGE_CLASS_EXIST = "Class already exist. Please try a different one";
const MESSAGE_CREATE_CLASSS_SUCCESS = "Class created successfully";
const MESSAGE_UPDATE_CLASSS_SUCCESS = "Class updated successfully";
const MESSAGE_DELETE_CLASSS_SUCCESS = "Class deleted successfully";
const MESSAGE_DELETE_CLASSS_ERROR = "Couldn't delete the Class";
const MESSAGE_CLASS_NOT_ALLOWED_DELETE_REFERENCE_EXIST =
  "The selected class is in use and not allowed to be deleted.";
const MESSAGE_CLASS_TAKEN =
  "Class name already taken. Please try a different one.";

const MESSAGE_GET_SECTIONS_SUCCESS = "Sections retrieved successfully";
const MESSAGE_GET_SECTION_SUCCESS = "Section retrieved successfully";
const MESSAGE_SECTION_EXIST =
  "Section already exist. Please try a different one";
const MESSAGE_CREATE_SECTION_SUCCESS = "Section created successfully";
const MESSAGE_SECTION_NOT_FOUND = "The selected section could not be found";
const MESSAGE_SECTION_NOT_FOUND_UNDER_CLASS =
  "The selected section could not be found in the selected class";
const MESSAGE_SECTIONS_NOT_FOUND =
  "There are no sections available under the given class";
const MESSAGE_UPDATE_SECTION_SUCCESS = "Section updated successfully";
const MESSAGE_SECTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST =
  "The selected section is in use and not allowed to be deleted.";
const MESSAGE_DELETE_SECTION_SUCCESS = "Section deleted successfully";
const MESSAGE_DELETE_SECTION_ERROR = "Couldn't delete the section";
const MESSAGE_SECTION_TAKEN =
  "Section name (or) iso already taken. Please try a different one.";

module.exports = {
  MESSAGE_MISSING_REQUIRED_FIELDS,
  MESSAGE_INVALID_EMAIL_FORMAT,
  MESSAGE_PASSWORD_CONSTRAINTS_NOT_MET,
  MESSAGE_EMAIL_USERNAME_EXIST,
  MESSAGE_USER_NOT_FOUND,
  MESSAGE_EMAIL_USERNAME_NOT_EXIST,
  MESSAGE_OLD_PASSWORD_ERROR,
  MESSAGE_PASSWORD_CHANGE_SUCCESS,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_NOT_LOGGED_IN_YET,
  MESSAGE_NOT_AUTHORIZED,
  MESSAGE_USER_LOGOUT_SUCCESS,
  MESSAGE_UNAUTHENTICATED,
  MESSAGE_USER_REGISTER_SUCCESS,
  MESSAGE_USER_LOGIN_SUCCESS,
  MESSAGE_USER_NOT_ALLOWED_DELETE,
  MESSAGE_USER_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_UPDATE_USER_SUCCESS,
  MESSAGE_DELETE_USER_ERROR,
  MESSAGE_DELETE_USER_SUCCESS,
  MESSAGE_GET_USER_SUCCESS,
  MESSAGE_GET_USERS_SUCCESS,
  MESSAGE_PAGE_NOT_FOUND,
  MESSAGE_GET_PERMISSIONS_SUCCESS,
  MESSAGE_GET_PERMISSION_SUCCESS,
  MESSAGE_PERMISSION_NOT_FOUND,
  MESSAGE_GET_ROLES_SUCCESS,
  MESSAGE_ROLE_NOT_FOUND,
  MESSAGE_GET_ROLE_SUCCESS,
  MESSAGE_ROLE_EXIST,
  MESSAGE_ROLE_PERMISSION_NOT_FOUND,
  MESSAGE_CREATE_ROLE_SUCCESS,
  MESSAGE_UPDATE_ROLE_SUCCESS,
  MESSAGE_ROLE_NOT_ALLOWED_DELETE,
  MESSAGE_ROLE_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_ROLE_ERROR,
  MESSAGE_DELETE_ROLE_SUCCESS,
  MESSAGE_GET_GENDERS_SUCCESS,
  MESSAGE_GET_GENDER_SUCCESS,
  MESSAGE_GENDER_NOT_FOUND,
  MESSAGE_GENDER_EXIST,
  MESSAGE_CREATE_GENDERS_SUCCESS,
  MESSAGE_UPDATE_GENDERS_SUCCESS,
  MESSAGE_DELETE_GENDERS_SUCCESS,
  MESSAGE_DELETE_GENDERS_ERROR,
  MESSAGE_GENDER_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_GET_COUNTRIES_SUCCESS,
  MESSAGE_GET_COUNTRY_SUCCESS,
  MESSAGE_COUNTRY_EXIST,
  MESSAGE_CREATE_COUNTRY_SUCCESS,
  MESSAGE_COUNTRY_NOT_FOUND,
  MESSAGE_UPDATE_COUNTRY_SUCCESS,
  MESSAGE_COUNTRY_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_COUNTRY_SUCCESS,
  MESSAGE_DELETE_COUNTRY_ERROR,
  MESSAGE_GET_STATES_SUCCESS,
  MESSAGE_GET_STATE_SUCCESS,
  MESSAGE_STATE_EXIST,
  MESSAGE_CREATE_STATE_SUCCESS,
  MESSAGE_STATE_NOT_FOUND,
  MESSAGE_STATE_NOT_FOUND_UNDER_COUNTRY,
  MESSAGE_STATES_NOT_FOUND,
  MESSAGE_UPDATE_STATE_SUCCESS,
  MESSAGE_STATE_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_STATE_SUCCESS,
  MESSAGE_DELETE_STATE_ERROR,
  MESSAGE_GET_CITIES_SUCCESS,
  MESSAGE_GET_CITY_SUCCESS,
  MESSAGE_CITY_EXIST,
  MESSAGE_CREATE_CITY_SUCCESS,
  MESSAGE_CITY_NOT_FOUND,
  MESSAGE_CITY_NOT_FOUND_UNDER_STATE,
  MESSAGE_CITIES_NOT_FOUND,
  MESSAGE_UPDATE_CITY_SUCCESS,
  MESSAGE_CITY_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_CITY_SUCCESS,
  MESSAGE_DELETE_CITY_ERROR,
  MESSAGE_CREATE_PROFILE_SUCCESS,
  MESSAGE_PROFILE_EXIST,
  MESSAGE_GET_PROFILES_SUCCESS,
  MESSAGE_GET_PROFILE_SUCCESS,
  MESSAGE_PROFILE_NOT_FOUND,
  MESSAGE_OWN_PROFILE_NOT_FOUND,
  MESSAGE_PROFILE_NOT_FOUND_UNDER_USER,
  MESSAGE_UPDATE_PROFILE_SUCCESS,
  MESSAGE_DELETE_PROFILE_SUCCESS,
  MESSAGE_DELETE_PROFILE_ERROR,
  MESSAGE_ACCESS_DENIED_NO_ROLES,
  MESSAGE_ACCESS_DENIED_NO_PERMISSION,
  MESSAGE_GET_AUDITS_SUCCESS,
  MESSAGE_GET_AUDIT_SUCCESS,
  MESSAGE_AUDIT_NOT_FOUND,
  MESSAGE_ROLE_TAKEN,
  MESSAGE_GENDER_TAKEN,
  MESSAGE_COUNTRY_TAKEN,
  MESSAGE_STATE_TAKEN,
  MESSAGE_CITY_TAKEN,
  MESSAGE_GET_CLASSES_SUCCESS,
  MESSAGE_GET_CLASS_SUCCESS,
  MESSAGE_CLASS_NOT_FOUND,
  MESSAGE_CLASS_EXIST,
  MESSAGE_CREATE_CLASSS_SUCCESS,
  MESSAGE_UPDATE_CLASSS_SUCCESS,
  MESSAGE_DELETE_CLASSS_SUCCESS,
  MESSAGE_DELETE_CLASSS_ERROR,
  MESSAGE_CLASS_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_CLASS_TAKEN,
  MESSAGE_GET_SECTIONS_SUCCESS,
  MESSAGE_GET_SECTION_SUCCESS,
  MESSAGE_SECTION_EXIST,
  MESSAGE_CREATE_SECTION_SUCCESS,
  MESSAGE_SECTION_NOT_FOUND,
  MESSAGE_SECTION_NOT_FOUND_UNDER_CLASS,
  MESSAGE_SECTIONS_NOT_FOUND,
  MESSAGE_UPDATE_SECTION_SUCCESS,
  MESSAGE_SECTION_NOT_ALLOWED_DELETE_REFERENCE_EXIST,
  MESSAGE_DELETE_SECTION_SUCCESS,
  MESSAGE_DELETE_SECTION_ERROR,
  MESSAGE_SECTION_TAKEN,
};
