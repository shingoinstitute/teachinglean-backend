/**
 * Entry.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
	schema: true,
	
	attributes: {
		id: {
			type: 'integer',
			primaryKey: true,
			autoIncrement: true
		},

		title: {
			type: 'string',
			maxLength: 255
		},

		content: {
			type: 'string',
			maxLength: 30000
		},

		markedCorrect: {
			type: 'boolean',
			defaultsTo: false
		},

		isFlagged: {
			type: 'boolean',
			defaultsTo: false
		},

		parent: {
			model: 'entry'
		},

		answers: {
			collection: 'entry',
			via: 'parent'
		},

		comments: {
			collection: 'comment',
			via: 'parent'
		},

		tags: {
			collection: 'entryTag',
			via: 'questions'
		},

		users_did_upvote: {
			collection: 'user',
			via: 'questions_did_upvote'
		},

		users_did_downvote: {
			collection: 'user',
			via: 'questions_did_downvote'
		},

		owner: {
			model: 'user'
		},

		toJSON: function() {
			var obj = this.toObject();
			// if (!obj.users_did_upvote) obj.users_did_upvote = [];
			// if (!obj.user_did_downvote) obj.users_did_downvote = [];
			return obj;
		}
	}
};
