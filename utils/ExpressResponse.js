class ExpressResponse extends Error {
  constructor(status, statusCode, message, data = null, pagination = null) {
    super();
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }
}

module.exports = ExpressResponse;
