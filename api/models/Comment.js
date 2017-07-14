/**
 * Comment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	schema: true,
	attributes: {
		id: {
			type: 'integer',
			primaryKey: true,
			autoIncrement: true
		},

		content: {
			type: 'string',
			maxLength: 1200
		},

		parent: {
			model: 'entry'
		},

		owner: {
			model: 'user'
		}

	}
};
