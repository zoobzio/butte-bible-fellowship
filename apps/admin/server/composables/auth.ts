import type { Contract, User } from "@bbf/patents/config";
import type { GoogleClaims } from "@letters-patent/google";
import type { Bridge } from "letters-patent/sdk";
import type { H3Event } from "h3";

import config from "@bbf/patents/config";
import { createGoogleProvider } from "@letters-patent/google";
import { defineSchema } from "letters-patent";
import { defineState } from "letters-patent/sdk";
import { createError, getRequestURL } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";

import { AUTH_PREFIX, GRANTS } from "~~/server/constants/auth";
import { requiredScope } from "~~/server/utils/auth";
import { useDatabase } from "#layers/bbf/server/composables/database";

/** The schema over `@bbf/patents`: what every auth action proves the user against. */
export const schema = defineSchema<Contract>(config.contract);

/**
 * The bridge: Google says who signed in, the `users` table what they may
 * do. A user is found by Google's subject; the first time they sign in,
 * by the email they were added with, when Google has verified it, which
 * binds the subject to them. Anyone else is signed in with no grants.
 */
export const bridge: Bridge<GoogleClaims, Contract> = async (claims) => {
  const db = useDatabase();
  let user = await db.admin.users.subject.first({ sub: claims.sub });
  if (user === null && claims.email !== undefined && claims.email_verified) {
    user = await db.admin.users.claim.first({
      sub: claims.sub,
      email: claims.email,
      name: claims.name ?? null,
      picture: claims.picture ?? null,
    });
  }
  return {
    sub: claims.sub,
    ...(claims.email === undefined ? {} : { email: claims.email }),
    ...(claims.email_verified === undefined
      ? {}
      : { email_verified: claims.email_verified }),
    ...(claims.name === undefined ? {} : { name: claims.name }),
    ...(claims.picture === undefined ? {} : { picture: claims.picture }),
    scopes: user === null ? [] : [...GRANTS[user.role]],
    roles: user === null ? [] : [user.role],
    meta: {},
  };
};

/**
 * Sign-in for the admin. `provider` is Google sign-in for one request,
 * over the OAuth client and the session secret the runtime config names;
 * Google sends the browser back to the callback action at the origin the
 * request came in on, which the OAuth client must list among its redirect
 * URIs. `user` is who is signed in on a request, or `null`. `authorize`
 * holds an API request to the scope it needs: 401 for nobody, 403 for
 * anyone short of it.
 */
export const useAuthentication = () => {
  const provider = (event: H3Event) => {
    const { google, sessionSecret } = useRuntimeConfig(event);
    return createGoogleProvider(
      schema,
      {
        event,
        clientId: google.clientId,
        clientSecret: google.clientSecret,
        redirectUri: `${getRequestURL(event).origin}${AUTH_PREFIX}/callback`,
        secret: sessionSecret,
      },
      bridge,
    );
  };

  const user = async (event: H3Event): Promise<User | null> => {
    const state = defineState(schema);
    await provider(event).resolve(state, schema);
    return state.current;
  };

  const authorize = async (event: H3Event): Promise<void> => {
    const signedIn = await user(event);
    if (signedIn === null) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    const scope = requiredScope(getRequestURL(event).pathname, event.method);
    if (scope === undefined || !signedIn.scopes?.includes(scope)) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
  };

  return { provider, user, authorize };
};
