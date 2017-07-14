/**
 * isCommentOwner.js
 *
 * @module      :: Policy
 * @description :: Policy that checks if the user is the owner of a comment
 *
 */

module.exports = function (req, res, next) {
	Comment.findOne({id: req.param('id')})
	.populate("owner")
	.exec(function(err, comment) {
		if (err) return res.negotiate(err);
		if (!comment) return res.status(404).json('comment not found');
		if (comment.owner.uuid == req.user.uuid) return next();
		return res.status(403).json('user not authorized');
	});
};
