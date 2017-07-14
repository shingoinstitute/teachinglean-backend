/**
*  @desc AppService.js - A place to put custom functions used througout the app.
*
*/

var Promise = require('bluebird');
var uuid = require('node-uuid');

module.exports = {

	/**
	 * @description objToString :: stringifies and flattens an array
	 */
	arrayToString: function(arr) {
		if (Array.isArray(arr)) {
			var string = "";
			for (var i = 0; i < arr.length; i++) {
				string += arr[i];
				if (i < arr.length - 1) { string += ", "; }
			}
			return string;
		} else if (typeof arr === 'object') {
			return JSON.stringify(arr);
		} else {
			throw new Error('Error: cannot stringify array ', arr);
		}
	},

	checkForUuidCollisions: function(values) {
		return new Promise(function(resolve, reject) {
			User.findOne({uuid: values.uuid}).exec(function(err, user) {
				if (err) return reject(err);
				if (!user) return resolve(values);
				values.uuid = uuid.v4();
				return AppService.checkForUuidCollisions(values);
			});
		});
	},

	getTimestamp() {
		const msecPerHour = 1000 * 60 * 60;
		const tzOffset = new Date().getTimezoneOffset();
		const MST2UTCTzOffsetInHours = 6;
		if (tzOffset === 0) {
			return `${new Date(Date.now() - (msecPerHour*MST2UTCTzOffsetInHours)).toLocaleString()} MST`;
		}
		return new Date(Date.now() - (msecPerHour*(tzOffset/60))).toLocaleString();
	}

}
