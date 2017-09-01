/**
 * EntryController
 *
 * @description :: Server-side logic for managing entries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	upvote: function(req, res) {
		var entryId = req.param('id');
		var user = req.user;
		user.questions_did_upvote.add(entryId);
		user.questions_did_downvote.remove(entryId);
		user.save(function(err) {
			if (err) return res.json({error: err});
			Entry.findOne({id: entryId})
			.populate('users_did_upvote')
			.populate('users_did_downvote')
			.exec(function(err, entry) {
				if (err) return res.json({error: err});
				if (!entry) return res.json({error: 'entry not found, failed to add upvote.'});
				return res.json(entry.toJSON());
			});
		});
	},

	downvote: function(req, res) {
		var entryId = req.param('id');
		var user = req.user;
		user.questions_did_downvote.add(entryId);
		user.questions_did_upvote.remove(entryId);
		user.save(function(err) {
			if (err) return res.json({error: err});
			Entry.findOne({id: entryId})
			.populate('users_did_upvote')
			.populate('users_did_downvote')
			.exec(function(err, entry) {
				if (err) return res.json({error: err});
				if (!entry) return res.json({error: 'entry not found, failed to add downvote'});
				return res.json(entry.toJSON());
			});
		});
	},

	topResults: function(req, res) {
		Entry.find({
			where: {
				parent: null
			}
		})
		.populate('users_did_upvote')
		.populate('users_did_downvote')
		.exec(function(err, entries) {
			entries.sort(function(a, b) {
				// Simple calculation to determine entry "popularity"
				// Get difference between number of upvotes to number of downvotes and compare between the two entries.
				var aPop = a.users_did_downvote.length + a.users_did_upvote.length;
				var bPop = b.users_did_downvote.length + b.users_did_upvote.length;
				return aPop - bPop;
			});
			if (entries.length > 10) entries = entries.slice(0, 10);
			return res.json(entries);
		});
	},

	/**
	 * @description Handler for `put /entry/:id/accept`. 
	 * This route is used to allow the owner of a "question entry" to update
	 * the `markedCorrect` property on an "answer entry" that they do not own, but
	 * is a child entry of the "question entry".
	 * 
	 * @param accepted {boolean} This handler expects a variable named `accepted` in the body of the request.
	 */
	acceptAnswer: function(req, res) {
		const id = req.params.id;
		const isAccepted = req.body.accepted;

		Entry.findOne({ id: id })
		.populate("parent")
		.then(function(entry) {
			if (entry.parent.owner === req.user.uuid)
				return Entry.update({ id: id }, { markedCorrect: isAccepted });
			return res.status(403).json({ error: "user not authorized." });
		})
		.then(function(entry) {
			if (Array.isArray(entry))
				entry = entry.pop();
			return res.json(entry.toJSON());
		})
		.catch(function(err) {
			res.status(500).json(err);
		});
	}

};

