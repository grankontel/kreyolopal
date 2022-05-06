const express = require('express');
const { body, validationResult, param } = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const userService = require('../services/userService');
const sendEmail = require('../services/emailService');
const db = require('../database/models');
const { authenticateUser, logUserIn } = require('../services/lib.auth');

const { User } = db;

passport.use(
  new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
    authenticateUser(username, password).then(
      (value) => done(null, value),
      (reason) => done(reason, false)
    );
  })
);

const auth_route = ({ logger }) => {
  const router = express.Router();

  router.post(
    '/auth/login',
    [
      // username must be an email
      body('email').isEmail(),
      // password must be at least 6 chars long
      body('password').isString(),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', error: errors.array() });
      }

      const { email, password } = req.body;
      return authenticateUser(email, password).then(
        (user) => {
          if (!user) {
            return res
              .status(401)
              .json({ status: 'error', error: 'Unauthorized' });
          }

          req.session.passport = {
            id: user.id,
            username: user.email,
          };

          return logUserIn(user, req, res);
        },
        (reason) => {
          logger.error(reason);
          return res
            .status(500)
            .json({ status: 'error', error: 'Internal error' });
        }
      );
    }
  );

  router.post(
    '/auth/logout',
    passport.authenticate('jwt-cookiecombo', {
      session: false,
    }),
    (req, res) => {
      req.logout();
      res.status(200).send({
        status: 'success',
        data: {},
      });
    }
  );

  router.post(
    '/auth/register',
    [
      body('email').isEmail(),
      // password must be at least 6 chars long
      body('password1').isLength({ min: 5 }),
      body('password2').custom((value, { req }) => {
        if (value !== req.body.password1) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
      body('firstname').notEmpty(),
      body('lastname').notEmpty(),
      body('gender').optional().isIn(['Homme', 'Femme']),
    ],
    (req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', error: errors.array() });
      }

      const record = {
        email: req.body.email.toLowerCase(),
        password: req.body.password1,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
      };
      const origin = `${req.protocol}://${req.get('host')}`;

      return userService
        .register(record)
        .then(
          (_saveduser) => {
            logger.info('register success');

            const templateData = {
              user: {
                id: _saveduser.id,
                firstname: _saveduser.firstname,
                lastname: _saveduser.lastname,
                email: _saveduser.email,
              },
              confirm_url: `${origin}/api/verifymail/${_saveduser.email_verif_token}`,
            };
            const recipient_mail = _saveduser.email;

            return sendEmail(
              'verifyemail.mjml',
              templateData,
              `'${_saveduser.firstname} ${_saveduser.lastname}' <${recipient_mail}>`,
              'Kontan vwè-w'
            ).then(
              () =>
                res.status(201).send({
                  status: 'success',
                  data: {
                    email: record.email,
                    firstname: record.firstname,
                    lastname: record.lastname,
                  },
                }),
              (reason) => {
                logger.error(reason);
                return res.status(201).send({
                  status: 'success',
                  data: {
                    email: record.email,
                    firstname: record.firstname,
                    lastname: record.lastname,
                  },
                });
              }
            );
          },
          (error) => {
            logger.error(error);
            res.status(500).send({ status: 'error', error });
          }
        )
        .catch((_error) => {
          res.status(500).send({ status: 'error', error: [_error] });
        });
    }
  );

  router.get(
    '/verifymail/:token',
    [
      param('token')
        .notEmpty()
        .custom((value) => {
          const isToken = /[A-Za-z0-9]{64}/;
          return value.length > 0 && isToken.test(value);
        }),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ status: 'error', error: errors.array() });
      }

      const { token } = req.params;

      return User.findOne({ where: { email_verif_token: token } }).then(
        (_user) => {
          if (_user === null) {
            return res
              .status(404)
              .json({ status: 'error', error: 'Not Found' });
          }

          _user.email_verif_token = undefined;
          return logUserIn(_user, req, res);
        }
      );
    }
  );

  logger.info('\tAdding route "auth"...');
  return router;
};

module.exports = auth_route;
