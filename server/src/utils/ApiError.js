class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = []
    // stack = ""
  ) {
    super(message); //super ?
    (this.statusCOde = statusCode),
      (this.data = null),
      (this.message = message),
      (this.sucess = false),
      (this.errors = errors);
  }
}
export { ApiError };
