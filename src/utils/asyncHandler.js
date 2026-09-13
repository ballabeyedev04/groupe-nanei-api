// Évite un try/catch dans chaque contrôleur async : une rejection est
// transmise à next(), donc au middleware d'erreurs central.
module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
