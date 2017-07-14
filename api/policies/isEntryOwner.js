/**
 * isEntryOwner.js
 *
 * @module      :: Policy
 * @description :: Policy that checks if the user is the owner of an entry
 *
 */

module.exports = function (req, res, next) {
	Entry.findOne({id: req.param('id')})
	.populate("owner")
	.populate("parent")
	.exec(function(err, entry) {
		if (err) return res.negotiate(err);
		if (!entry) return res.status(404).json('entry not found');
		if (entry.owner.uuid == req.user.uuid) return next();
		if (entry.parent.owner == req.user.uuid && req.method == "PUT" && req.body.markedCorrect) {
			entry.markedCorrect = req.body.markedCorrect;
			entry.save(function(err) {
				if (err) return res.negotiate(err);
				entry.parent = entry.parent.id;
				return res.json(entry)
			});
		} else {
			return res.forbidden('user not authorized');
		}
	});
};
