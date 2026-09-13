module.exports = function notFound(req, res) {
  res.status(404).json({ succes: false, message: `Route introuvable : ${req.method} ${req.originalUrl}` });
};
