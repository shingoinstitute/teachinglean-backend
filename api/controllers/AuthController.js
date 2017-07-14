/**
*
*  @description - AuthController.js
*
*/

var passport = require('passport');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');

module.exports = {

	localAuth: function (req, res) {
		passport.authenticate('local', function (err, user, info) {
			var timestamp = AppService.getTimestamp();
			if (err) {
				sails.log.error(`${err.message}\n\tAuthController.js::localAuth.\n\ttimeStamp: ${timestamp}`);
				return res.status(500).json({ 
					error: err,
					timestamp: timestamp,
					info: info || 'login error using local auth strategy.'
				});
			}

			if (!user) {
				sails.log.warn(`Undefined user on login with local auth strategy.\n\tAuthController.js::localAuth.\n\t${timestamp}.`);
				return res.status(404).json({ 
					error: `Account using ${req.param('username')} was not found.`, 
					info: info
				});
			}
			
			req.logIn(user, function (err) {
				if (err) return res.negotiate(err);

				var token = AuthService.createToken(user);
				res.cookie('XSRF-TOKEN', token, {
					secure: process.env.NODE_ENV === 'production',
					domain: '.teachinglean.org'
				});

				return res.json({
					success: true,
					user: user.toJSON(),
					'xsrf-token': token
				});
			});
		})(req, res);
	},

	linkedInAuth: function (req, res) {
		passport.authenticate('linkedin')(req, res);
	},

	linkedInAuthCallback: function (req, res) {
		passport.authenticate('linkedin', {
			failureRedirect: '/login'
		})(req, res, function (err) {

			if (err) {
				sails.log.error(err);
				return res.negotiate(err);
			}

			var token = AuthService.createToken(req.user);
			res.cookie('XSRF-TOKEN', token, {
				secure: process.env.NODE_ENV === 'production',
				domain: '.teachinglean.org'
			});

			var url = `${process.env.HOST_SERVER}`;
			if (!url && process.env.NODE_ENV === 'development') {
				url = `http://localhost:${process.env.PORT || 3000}`;
			} else {
				url = `https://teachinglean.org`;
			}
			return res.redirect(`${url}/auth/linkedin/callback?xsrf-token=${token}`);
		});
	},

	logout: function (req, res) {
		req.logout();
		delete res.cookie['XSRF-TOKEN'];
		return res.json('loggout successful');
	},

  verifyEmail: function (req, res) {
    var uuid = req.param('id'); // user's uuid
    var token = req.param('vt'); // verification token

    User.findOne({ uuid: uuid }).exec(function (err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.status(404).json('E_USER_NOT_FOUND');

      if (!token || !user.emailVerificationToken) {
        return res.view('/dashboard');
      }

      try {
        var tokenIsValid = bcrypt.compareSync(token, user.emailVerificationToken);
      } catch (e) {
        return res.json({
          error: e.message
        });
      }

      if (!tokenIsValid) return res.status(403).json('user not authorized');

      user.verifiedEmail = user.email;
      user.emailVerificationToken = '';

      user.save(function (err) {
        if (err) return res.negotiate(err);
      });

      return res.redirect('/verifyEmail/' + user.uuid);

    });
  },

  /**
   * This route is called by the browser when a user visits `/api/verifyEmail/:id`.
   * The purpose of this function is to... (drum roll) verify the email token!
   */
  apiVerifyEmail: function(req, res) {
    var uuid = req.param('id');

    if (!uuid) {
      return res.status(404).json({
        error: "user not found."
      });
    }

    User.findOne({uuid: uuid}).exec(function(err, user) {
      if (err) return res.negotiate(err);

      if (!user) return res.status(404).json({
        success: false,
        error: "user not found."
      });

      if (user.verifiedEmail && user.verifiedEmail === '')
        return res.status(403).json({
          success: false,
          error: "user email address has not been verified"
        });

      user.save(function(err) {
        if (err) sails.log.error(err);
      });

      return res.json({
        success: true,
        email: user.email
      });
    });
  }

};
