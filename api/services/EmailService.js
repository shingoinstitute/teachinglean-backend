
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var smtpTransporter = require('nodemailer-smtp-transport');
var bcrypt = require('bcrypt');

const tokenExpires = sails.config.email.tokenExpires;
const saltRounds = sails.config.email.saltRounds;

var transporter = nodemailer.createTransport(smtpTransporter({
	host: 'outlook.office365.com',
	secureConnection: false,
	port: 587,
	auth: {
		user: process.env.SHINGO_IT_EMAIL || sails.config.email.SHINGO_IT_EMAIL,
		pass: process.env.SHINGO_IT_PWORD || sails.config.email.SHINGO_IT_PWORD
	},
	tls: {
		ciphers: 'SSLv3'
	}
}));

transporter.sendMailAsync = Promise.promisify(transporter.sendMail);

module.exports = {

	/**
	 * @description sendVerificationEmail :: sends verifcation email to user's primary email address
	 */
	sendVerificationEmail: function (user) {
		var token = AuthService.generateBase64Token(user);
		user.emailVerificationToken = bcrypt.hashSync(token, saltRounds);
		user.save(function(err) {
			if (err) sails.log.error(err);
		});

		var redirectUrl = sails.config.email.emailVerificationURL + "/" + user.uuid + "?vt=" + token;

		return transporter.sendMailAsync({
			from: 'shingo.it@usu.edu',
			to: user.email,
			subject: 'teachinglean.org - email verification link',
			html: '<img src="https://teachinglean.org/images/logos/LEAN-logo-md.png" alt="teachinglean.org" />' +
					'<p>Thank you for signing up with teachinglean.org, we&#39;re excited to see you join the community.</p>' + '<br />' +
					'<p>Please use the link below to verify your email address.</p>' + '<br />' +
					'<p>' + redirectUrl + '</p>'
		});
	},

	/**
	 * @description sendPasswordResetEmail :: Creates a JSON web token to use as a password reset token, then sends an email to the recipient with the token as a URL parameter
	 * @param {User} user :: waterline user object containing email property and .save() prototype method
	 */
	sendPasswordResetEmail: function(email) {
		return new Promise(function(resolve, reject) {
			User.findOne({email: email}).exec(function(err, user) {
				if (err) return reject(err);
				if (!user) return reject(new Error('user not found'));

				// generate a new token
				AuthService.generateBase64Token(user, function(err, token) {
					if (err) return reject(err);

					user.resetPasswordToken = bcrypt.hashSync(token, saltRounds);
					user.resetPasswordExpires = Date.now() + tokenExpires;
					user.save(function(err){
						if (err) sails.log.error(err);
					});

					var scheme = process.env.NODE_ENV === "development" ? "http" : "https";
					var redirectUrl = `${scheme}://teachinglean.org/reset/${user.uuid}?token=${token}`;

					transporter.sendMailAsync({
						from: 'shingo.it@usu.edu',
						to: user.email,
						subject: 'Important: Password Reset for TeachingLEAN.org - NO REPLY',
						html: `
						<style>
							.center {
								text-align: center;
							}
							.container {
								width: 100%;
							}
							.inner-container {
								width: 480px;
								margin: 0 auto;
								word-break:break-all;
							}
						</style>

						<div class="container">
							<div class="inner-container">
								<img src="https://teachinglean.org/images/logos/LEAN-logo-md.png">
								<p> Dear ${user.firstname}</p>
								<p>To reset your password, click on the following secure link.</p>
								<!-- <p>${redirectUrl}</p> -->
								<p><a href="${redirectUrl}">${redirectUrl}</a></p>
								<p>This link will expire in 15 minutes.</p>
								<p>Please note that if you did not initiate the password reset from our website you can disregard this message.</p>
								<p>Thank you,</p>
								<p>Lean Education Academic Network, <a href="https://teachinglean.org">teachinglean.org</a></p>
								<p>This is an automated message, please do not reply.</p>
							</div>
						</div>
						`
					});

					return resolve();
				});
			});
		})

	}
}
