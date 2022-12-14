// TODO: what the fuck it does
module.exports = func => (req, res, next) => Promise.resolve(func(req, res, next)).catch(next);