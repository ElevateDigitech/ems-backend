const VALID_EMAIL = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const VALID_PASSWORD =
  /^(?=(.*[A-Z]){0,1})(?=(.*[a-z]){1,})(?=(.*[0-9]){1,})(?=(.*[\W_]){0,1})(.{12,})$/;
const VALID_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_PHONE = /^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/;

module.exports = {
  VALID_EMAIL,
  VALID_PASSWORD,
  VALID_DATE,
  VALID_PHONE,
};
