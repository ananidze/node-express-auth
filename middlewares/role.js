module.exports =  function roleMiddleware(allowedRoles) {
    return function(req, res, next) {
      if (req.user && allowedRoles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Forbidden' });
      }
    }
}