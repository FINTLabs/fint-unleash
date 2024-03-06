/**
 * Azure AD hook for securing an Unleash server
 *
 * This example assumes that all users authenticating via
 * azure should have access. You would probably limit access
 * to users you trust, for example users within a tenant.
 *
 * The implementation assumes the following environment variables:
 *
 *  - AUTH_HOST
 *  - AUTH_CLIENT_ID
 *  - AUTH_CLIENT_SECRET
 *  - AUTH_TENANT_ID
 */

import {
  User,
  AuthenticationRequired,
  IUnleashServices,
  IUnleashConfig,
} from 'unleash-server';
import passport from '@passport-next/passport';
import { IProfile, OIDCStrategy, VerifyCallback } from 'passport-azure-ad';
import { Application } from 'express';

const host = process.env.AUTH_HOST;
const clientID = process.env.AUTH_CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const tenantID = process.env.AUTH_TENANT_ID;

export default function azureAdminOauth(
  app: Application,
  config: IUnleashConfig,
  services: IUnleashServices,
) {
  const { userService } = services;

  passport.use(
    'azure',
    new OIDCStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${tenantID}/v2.0/.well-known/openid-configuration`,
        clientID: clientID as string,
        clientSecret,
        redirectUrl: `${host}/api/auth/callback`,
        responseType: 'code',
        responseMode: 'query',
        scope: ['openid', 'email'],
        allowHttpForRedirectUrl: true,
        passReqToCallback: false, // Add this line
      },
      async (profile: IProfile, done: VerifyCallback) => {
        const user = await userService.loginUserWithoutPassword(
          profile._json.email,
          true,
        );
        done(null, user);
      },
    ),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user: User, done: VerifyCallback) =>
    done(null, user),
  );
  passport.deserializeUser((user: User, done: VerifyCallback) =>
    done(null, user),
  );

  app.get(
    '/auth/azure/login',
    passport.authenticate('azure', { scope: ['email'] }),
  );
  app.get(
    '/api/auth/callback',
    passport.authenticate('azure', {
      failureRedirect: '/api/admin/error-login',
    }),
    (req, res) => {
      res.redirect('/');
    },
  );

  app.use('/api/admin/', (req, res, next) => {
    if (req.user) {
      next();
    } else {
      return res
        .status(401)
        .json(
          new AuthenticationRequired({
            path: '/auth/azure/login',
            type: 'custom',
            message: `You have to identify yourself in order to use Unleash. Click the button and follow the instructions.`,
          }),
        )
        .end();
    }
  });
}
