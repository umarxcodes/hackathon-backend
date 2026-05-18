class ApiResponse {
  static success(res, data = {}, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static successList(res, data = [], total = 0, page = 1, limit = 10) {
    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data,
    });
  }

  static error(res, message = "Server Error", statusCode = 500) {
    return res.status(statusCode).json({ success: false, error: message });
  }
}

export default ApiResponse;
