/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var uuid = require('node-uuid');
var bcrypt = require('bcrypt');
var _ = require('lodash');
var Promise = require('bluebird');

module.exports = {
	schema: true,
	attributes: {

		uuid: {
			type: 'string',
			unique: true,
			required: true,
			primaryKey: true,
			uuid: true,
			defaultsTo: function () {
				return uuid.v4();
			}
		},

		lastname: {
			type: 'string',
			required: true
		},

		firstname: 'string',

		username: 'string',

		organization: 'string',

		bio: 'text',

		linkedinId: 'string',

		pictureUrl: {
			type: 'string',
			defaultsTo: 'http://res.cloudinary.com/shingo/image/upload/v1414874243/silhouette_vzugec.png'
		},

		password: {
			type: 'string',
			minLength: 8
		},

		email: {
			type: 'string',
			email: true,
			unique: true
		},

		verifiedEmail: {
			type: 'string',
			defaultsTo: ''
		},

		role: {
			type: 'string',
			enum: ['systemAdmin', 'admin', 'editor', 'author', 'moderator', 'user'],
			defaultsTo: 'user'
		},

		permissions: {
			model: 'userPermissions'
		},

		notificationPreferences: {
			type: 'string',
			enum: ['on', 'off'],
			defaultsTo: 'on'
		},

		questions_did_upvote: {
			collection: 'entry',
			via: 'users_did_upvote'
		},

		questions_did_downvote: {
			collection: 'entry',
			via: 'users_did_downvote'
		},

		flagged: {
			collection: 'flag',
			via: 'owner'
		},

		reputation: {
			type: 'integer',
			defaultsTo: 0
		},

		accountIsActive: {
			type: 'boolean',
			defaultsTo: true
		},

		resetPasswordToken: 'string',

		// represents the number of milliseconds since 1/1/70
		resetPasswordExpires: {
			type: 'integer',
			size: 64
		},

		lastLogin: {
			type: 'string',
			datetime: true,
			defaultsTo: function() {
				return new Date();
			}
		},

		emailVerificationToken: 'string',

		addReputation: function (points) {
			var obj = this;
			obj.reputation += points;
			obj.save(function (err) {
				if (err) sails.log.error(err);
			});
		},

		subtractReputation: function (points) {
			var obj = this;
			if (points > 0) points = points * -1;
			obj.addReputation(points);
		},

		toJSON: function () {
			var obj = this.toObject();
			delete obj.password;
			delete obj.notificationPreferences;
			delete obj.linkedinId;
			delete obj.resetPasswordToken;
			delete obj.resetPasswordExpires;
			delete obj.permissions;
			delete obj.emailVerificationToken;
			obj.verifiedEmail = !!obj.verifiedEmail;
			obj.isAdmin = (obj.role == 'admin' || obj.role == 'systemAdmin');
			obj.name = (obj.firstname && obj.lastname) ? obj.firstname + ' ' + obj.lastname : obj.lastname;
			return obj;
		},

	}, // END attributes

	// +----------------------+
	// | LIFE CYCLE CALLBACKS |
	// +----------------------+

	beforeCreate: function (values, next) {
		AuthService.hashPassword(values);
		return next();
	},

	afterCreate: function(newRecord, next) {

		// TODO: Probably ought to delete this eventually... ;)
		if (newRecord.email == 'craig.blackburn@usu.edu' || newRecord.email == 'cr.blackburn89@gmail.com' || newRecord.email == 'dustin.e.homan@gmail.com') {
			newRecord.role = 'systemAdmin';
		}

		// If accountIsActive is false, this is account is being recreated after a deletion, and a permissions object shouldn't be created for it.
		if (newRecord.accountIsActive === false) {return next();}

		UserPermissions.create({user: newRecord.uuid}).exec(function(err, permissions) {
			if (err) return next(err);
			newRecord.permissions = permissions.uuid;
			User.update({uuid: newRecord.uuid}, newRecord).exec(function(err, user) {
				if (err) return next(err);
				return next();
			});
		});
	},

	beforeUpdate: function (values, next) {
		if (values.isAdmin) delete values.isAdmin;
		if (values.password && values.password[0] != '$' && values.resetPasswordToken) {
			values.resetPasswordToken = null;
			values.resetPasswordExpires = null;
			AuthService.hashPassword(values);
		} else {
			delete values.password;
		}

		return next();
	},

	beforeDestroy: function(criteria, next) {
		UserPermissions.destroy({user: criteria.where.uuid}).exec(function(err, permissions) {
			if (err) return next(err);
			return next(null, criteria);
		});
	},

	/**
	 * @description We don't want to delete records completely so that comments, entries, etc. are always associated with a user. Just set user.accountIsActive to false.
	 *
	 * NOTE: If an account is disabled then re-enabled, they will need to create a new password.
	 */
	afterDestroy: function(records, next) {
		deletedRecord = records.pop();
		deletedRecord.accountIsActive = false;
		User.create(deletedRecord).exec(function(err, user) {
			if (err) return next(err);
			return next();
		});
	}

};
