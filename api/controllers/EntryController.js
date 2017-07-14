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
	}

};

