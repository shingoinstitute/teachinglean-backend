var assert = require('assert');
var uuid = require('node-uuid');
var AppService = require('../../../api/services/AppService');

describe('AppService.js', function() {
	describe('#checkForUuidCollisions(values)', function() {
		it('should recursively call itself until it finds a non-used UUID, assign it, then return a bluebird promise', function() {
			// create mock users to test with
			var user_1 = {
				firstname: 'bob',
				lastname: 'joe',
				email: 'bob.joe@fake.com',
			}

			var user_2 = {
				firstname: 'john',
				lastname: 'doe',
				email: 'john.doe@fake.com'
			}

			User.create(user_1).exec(function(err, user1) {
				if (err) assert.ifError(err);
				user_1 = user1;
				User.create(user_2).exec(function(err, user2) {
					if (err) assert.ifError(err);
					user_2 = user2;

					// set user_2's uuid to user_1's uuid for guarenteed collision
					user_2.uuid = user_1.uuid;

					AppService.checkForUuidCollisions(user_2)
					.then(function(values) {
						user_2 = values;
						console.log('test1id: ' + testId_1.uuid + '\ntest2id: ' + testId_2.uuid);
						assert.notEqual(user_1.uuid, user_2.uuid);

						User.destroy(user_1).exec();
						User.destroy(user_2).exec();

					});
				});
			});
		});
	});
});