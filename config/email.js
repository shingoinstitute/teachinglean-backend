/**
 * @description email.js :: exports env variables used for sending email verification links and password reset links.
 */

module.exports.email = {
	emailVerificationURL: process.env.HOST_SERVER || process.env.NODE_ENV == 'production' ? 'https://teachinglean.org/verifyEmail' : `http://localhost:${process.env.PORT || '3000'}/verifyEmail`,
	passwordResetURL: process.env.HOST_SERVER || process.env.NODE_ENV == 'production' ? 'https://teachinglean.org/reset' : `http://localhost:${process.env.PORT || '3000'}/reset`,
	saltRounds: 10,
	tokenExpires: 1000*60*60*12
}