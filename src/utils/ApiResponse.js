export class API_RESPONSE {
  static SUCCESS(res, status = 200, message = "Success", payload = {}) {
    return res.status(status).json({
      success: true,
      message,
      payload,
    });
  }

  static ERROR(res, status = 500, message = "Error", payload = undefined) {
    return res
      .status(status)
      .json({ success: false, message: message, payload });
  }
}
