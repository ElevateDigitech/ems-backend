class ExpressResponse extends Error {
  constructor(status, statusCode, message, data = null) {
    super();
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ExpressResponse;
