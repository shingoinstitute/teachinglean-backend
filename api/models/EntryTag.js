/**
 * EntryTag.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    schema: true,
    
    id: {
		  type: 'integer',
		  primaryKey: true,
		  autoIncrement: true
	  },

    name: 'string',

    questions: {
      collection: 'Entry',
      via: 'tags'
    },

    createdBy: {
      model: 'user'
    }

  },

  /**
   * @description beforeCreate :: lifecycle callback that checks that no other tags with the same name exist when creating a new one.
   */
  beforeCreate: function(values, done) {
    EntryTag.find().exec(function(err, tags) {
      if (err) return next(err);
      tags.forEach(function(tag) {
        if (tag.name.toLowerCase() === values.name.toLowerCase()) {
          return done(new Error('That tag name already exists!'));
        }
      });
      return done();
    });
  }

};

