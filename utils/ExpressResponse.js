class ExpressResponse extends Error {
  constructor(status, statusCode, message, data = null, total = null) {
    super();
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.total = total;
  }
}

module.exports = ExpressResponse;
