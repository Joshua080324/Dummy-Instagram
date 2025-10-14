function handleError(err, res) {
  console.error("Error:", err);

  if (err.name === "Unauthorized") {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  if (err.name === "InvalidLogin") {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (err.name === "NotFound") {
    return res.status(404).json({ message: "Data not found" });
  }

  if (err.name === "BadRequest") {
    return res.status(400).json({ message: err.message || "Bad request" });
  }

  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ message: messages });
  }

  return res.status(500).json({
    message: "Internal Server Error",
  });
}

module.exports = handleError;
