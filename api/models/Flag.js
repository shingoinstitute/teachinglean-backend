/**
 * Flag.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
			type: 'integer',
			primaryKey: true,
			autoIncrement: true
		},

    // Id for the flagged content
    content: {
      type: 'integer',
      required: true
    },

    // The table of the content
    type: {
      type: 'string',
      required: true
    },

    reason: {
      type: 'string',
      required: true
    },

    description: 'text',

    owner: {
      model: 'user'
    }
  }
};

