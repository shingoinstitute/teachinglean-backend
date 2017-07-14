/**
* @description :: UserController.js
*/

const _ = require('lodash');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const readChunk = require('read-chunk');
const fileType = require('file-type');

/**
 * @description :: Gets the file type
 * @param {string} path :: directory path to the file
 * @return {object} => {ext: 'png', mime: 'image/png'}
 */
function getFileType(path) {
  try {
    const stats = fs.statSync(path);
    const buffer = readChunk.sync(path, 0, stats.size);
    return fileType(buffer);
  } catch(err) {
    console.error(err.message);
  }
}

module.exports = {
  
  /**
   * @desc :: Handler for '/me', gets currently authenticated user
   */
  me: function (req, res) {
    var xsrf_header = req.get('X-XSRF-TOKEN');
    var xsrf_cookie = req.cookies['XSRF-TOKEN'];

    if (!xsrf_cookie) {
      xsrf_cookie = req.param('xsrf-token');
    }

    if (typeof xsrf_cookie === 'undefined' || typeof xsrf_header === 'undefined') {
      return res.status(403).json({ error: "Missing 'X-XSRF-TOKEN' header or 'XSRF-TOKEN' is not set in cookies" });
    }

    const secret = sails.config.passport.jwt.secret;

    const options = {
      audience: sails.config.passport.jwt.audience,
      algorithm: sails.config.passport.jwt.algorithm
    }

    var csrfHeaderPayload = jwt.verify(xsrf_header, secret, options);
    var csrfCookiePayload = jwt.verify(xsrf_cookie, secret, options);

    if (csrfHeaderPayload.user.uuid !== csrfCookiePayload.user.uuid) {
      return res.status(403).json({ error: "'X-XSRF-TOKEN' and 'XSRF-TOKEN' tokens present in header and cookies do not match." });
    }
    
    User.findOne({uuid: csrfCookiePayload.user.uuid}).exec((err, user) => {
      if (err) {
        delete res.cookies['XSRF-TOKEN'];
        sails.log.error(err);
        return res.status(500).json(err.toJSON());
      }

      if (!user) {
        delete res.cookies['XSRF-TOKEN'];
        return res.status(404).json({error: `user not found with id ${payload.user.uuid}`});
      }

      return res.json(user.toJSON());
    });
    
  },

  /**
   * @desc :: Handler for `/user/stats`, returns a few simple statistics about
   * the user base. Must be an admin to access this route.
   */
  stats: (req, res) => {
    User.find()
    .then(users => {

      var active = 0, disabled = 0, members = 0, admins = 0, moderators = 0, authors = 0, editors = 0, verifiedEmails = 0;

      users.map(user => {
        if (user.role == 'admin' || user.role == 'systemAdmin') {
          admins++;
        } else if (user.role === 'moderator') {
          members++;
        } else if (user.role === 'editor') {
          editors++;
        } else if (user.role === 'author') {
          authors++;
        } else if (user.role == 'user') {
          moderators++; }

        if (user.accountIsActive) {
          active++; }
        else {
          disabled++; }
        
        if (user.veriedEmail) { verifiedEmails++; }
      });
      
      return res.json({
          size: users.length,
          active: active,
          disabled: disabled,
          members: members,
          admins: admins,
          moderators: moderators,
          authors: authors,
          editors: editors,
          verifiedEmails: verifiedEmails
        });
    })
    .catch(err => {
      return res.negotiate(err);
    });
  },
  
  /**
   * @desc getPortrait :: Handler for '/user/portrait', returns user's profile image
   * @var id => User's uuid
   * @var fp => File path of the users profile picture
   */
  getPortrait: function(req, res) {
    var fp;
    if (process.env.NODE_ENV === 'development') {
      fp = path.resolve(sails.config.appPath, 'assets/images/profiles/');
    } else {
      fp = '/var/www/data/teachinglean/profilePictures';
    }
    fp += `/${req.user.uuid || ""}`;

    if (!fs.existsSync(fp)) {
      return res.status(404).json({ error: 'file not found.' });
    }

    fs.readFile(fp, function(err, data) {
      if (err) {
        return res.status(404).json({ error: err });
      }
      const type = getFileType(fp);
      res.writeHead(200, {'Content-Type': type.mime});
      res.end(data, 'binary');
    });
  },

  /**
   * @description :: Profile picture upload
   */
  photoUpload: function (req, res) {
    var profileDir;
    if (process.env.NODE_ENV === 'development') {
      profileDir = path.resolve(sails.config.appPath, 'assets/images/profiles/');
    } else {
      profileDir = '/var/www/data/teachinglean/profilePictures/';
    }

    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir);
    }
    
    req.file('profile').upload({
      // fileSize <~ 5MB
      dirname: profileDir,
      saveAs: `${req.user.uuid}`,
      maxBytes: 5000000
    }, function (err, uploadedFiles) {
      if (err) {
        return res.negotiate(err);
      }
      if (uploadedFiles.length == 0) {
        return res.badRequest('No file was uploaded');
      }
      
      var pictureDir = `${profileDir}/${req.user.uuid}`;

      /*** Check that file type is an image */
      const type = getFileType(pictureDir);
      if (type.ext === 'png' || type.ext === 'jpg' || type.ext === 'jpeg' || type.ext === 'tiff') {
        var pictureUrl;
        if (process.env.HOST_SERVER) {
          pictureUrl = `${process.env.HOST_SERVER}/user/portrait`;
        } else if (process.env.NODE_ENV === 'development'){
          pictureUrl = `http://localhost:${process.env.PORT}/backend/user/portrait`;
        } else {
          pictureUrl = `https://teachinglean.org/user/portrait`;
        }

        User.update(req.user.uuid, {
          pictureUrl: pictureUrl
        })
        .then(function () {
          res.ok(pictureUrl);
        })
        .catch(function (err) {
          return res.negotiate(err);
        });
      } else {
        fs.unlink(pictureDir, function(err) {
          sails.log.error(err.message);
        });
        return res.status(400).json({
          error: 'unsupported file type'
        });
      }
    });
  },
  
  find: function(req, res) {
    User.find().exec(function(err, users) {
      if (err) { return res.negotiate(err); }

      // Check for if user is an administrator
      if (req.user && req.user.role === 'admin' || req.user.role === 'systemAdmin' || req.user.role === 'moderator') {
        return res.json(users.map(user => {
          return user.toJSON();
        }));
      }

      // Remove email field from users if requesting user is not an admin
      return res.json(users.map(user => {
        user = user.toJSON();
        delete user.email;
        return user;
      }));
    });
  },

  create: function (req, res) {
    var newUser = {};
    newUser.email = req.param('email');
    newUser.password = req.param('password');
    newUser.firstname = req.param('firstname');
    newUser.lastname = req.param('lastname');
    
    if (!(newUser.email && newUser.password && newUser.firstname && newUser.lastname)) {
      return res.status(403).json({error: 'Could not create new account, missing required parameters (must have email, password, firstname, and lastname).'});
    }
    
    User.create(newUser).exec(function (err, user) {
      if (err) return res.status(400).json(err);
      
      if (Array.isArray(user)) user = user.pop();
      
      if (sails.config.environment === 'production') {
        EmailService.sendVerificationEmail(user)
        .then(function (info) {
          sails.log.info('Email verification link sent to ' + user.email);
        })
        .catch(function (err) {
          sails.log.error(err);
        });
      }

      // Create JWT token and add to cookies
      AuthService.createAndSetToken(res, user);
      
      return res.json({
        success: true,
        user: user.toJSON(),
        info: typeof info != 'undefined' ? info.response : ''
      });
    });
  },
  
  /**
  * Handler for GET "/reset/:id"
  */
  reset: function (req, res) {
    var uuid = req.param('id');
    var token = req.param('token');
    
    User.findOne({
      uuid: uuid
    }).exec(function (err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.status(404).json('user not found');
      // if (!AuthService.compareResetToken(token, user)) return res.redirect('/reset');
      return res.view('ok', {
        user: user.toJSON()
      });
    });
  },
  
  /**
  * Handler for route POST "/reset", expecting "email" parameter
  */
  sendPasswordResetEmail: function (req, res) {
    var email = req.param('email');
    console.log(`Password reset link requested for ${email} at ${new Date().toLocaleString()}`);
    if (!email) { return res.status(400).json("missing email param"); }
    User.findOne({email: email}).exec(function(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.status(404).json('user not found');
      EmailService.sendPasswordResetEmail(user.email)
      .then(function (info) {
        return res.json({
          success: true,
          info: `Password reset link succesfully sent to ${user.email}`
        });
      })
      .catch(function (err) {
        sails.log.error(err);
        return res.negotiate(err);
      });
    });
  },
  
  /**
  * Handler for PUT "/reset/:id", expects a token parameter to 
  * identify the user, and a password parameter as the new password
  */
  updatePassword: function (req, res) {
    var uuid = req.param('id');
    var token = req.param('token');
    var password = req.param('password');
    
    if (!token) return res.status(400).json({error: 'missing token'});
    
    if (!password) return res.status(400).json({error: 'missing password'});
    
    User.findOne({ uuid: uuid }).exec(function (err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.status(404).json({error: 'user not found'});
      if (!AuthService.compareResetToken(token, user)) {
        return res.negotiate({error: 'mismatched tokens'});
      }
      user.password = password;
      user.save(function (err) {
        if (err) {
          sails.log.error(err);
          return res.negotiate(err);
        }
        return res.json({
          success: true,
          info: `Password reset succesful for ${user.email}.`
        });
      });
    });
  },

  emailDoesExist: (req, res) => {
    var email = req.param('email') || "";
    User.findOne({email: email}).exec((err, user) => {
      if (err) return res.negotiate(err);
      if (user) {
        return res.json({doesExist: true});
      }
      return res.json({doesExist: false});
    });
  },

  usernameDoesExist: (req, res) => {
    var username = req.param('username') || "";
    User.findOne({username: username}).exec((err, user) => {
      if (err) return res.negotiate(err);
      if (user) {
        return res.json({doesExist: true});
      }
      return res.json({doesExist: false});
    });
  }

};
