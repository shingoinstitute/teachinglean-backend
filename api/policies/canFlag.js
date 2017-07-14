/**
 * canFlag.js
 *
 * @module      :: Policy
 * @description :: Policy that checks if the user can flag the requested content
 */

module.exports = function (req, res, next) {
	Flag.findOne({owner: req.param('owner'), content: req.param('content'), type: req.param('type')})
    .then(function(flag){
        if(flag) return res.forbidden("You have already flagged this!");
        return next();
    })
    .catch(function(err){
        return res.negotiate(err);
    })
};
