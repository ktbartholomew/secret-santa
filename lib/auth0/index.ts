import { IncomingMessage, ServerResponse } from "http";
import { Session, getSession } from "../session";
import { getUserById, User } from "../user";

const jwt = require("jsonwebtoken");
const { JwksClient } = require("jwks-rsa");

// No destructuring here to support the way Next.js parses process.env at
// build-time
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const SELF_URL = process.env.SELF_URL;

const jwks = new JwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
});

export interface IDToken {
  exp: number;
  iat: number;
  sid: string;
  sub: string;
  name: string;
}

const verify = async (token): Promise<IDToken> => {
  // decode but don't verify the token so we can parse its header
  const decoded = jwt.decode(token, { complete: true });
  const key = await jwks.getSigningKey(decoded.header.kid);

  return jwt.verify(token, key.publicKey, {
    audience: AUTH0_CLIENT_ID,
    algorithms: ["RS256"],
  });
};

async function exchangeCode(code: string): Promise<string> {
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    code: code,
    redirect_uri: `${SELF_URL}/api/authCallback`,
  });

  const resp = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const j = await resp.json();

  if (!j.id_token) {
    throw new Error("Unable to get an access token");
  }

  return j.id_token;
}

function redirectToLogin(res: ServerResponse<IncomingMessage>) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: AUTH0_CLIENT_ID,
    redirect_uri: `${SELF_URL}/api/authCallback`,
    scope: "openid profile",
  });

  res.statusCode = 302;
  res.setHeader(
    "location",
    `https://${AUTH0_DOMAIN}/authorize?${params.toString()}`
  );
  res.end();
}

function redirectToLogout(res: ServerResponse<IncomingMessage>) {
  const params = new URLSearchParams({
    client_id: AUTH0_CLIENT_ID,
    returnTo: `${SELF_URL}/logout`,
  });
  res.statusCode = 302;
  res.setHeader(
    "location",
    `https://${AUTH0_DOMAIN}/v2/logout?${params.toString()}`
  );
}

const getUserFromCookies = async function ({
  auth0_id_token,
}: {
  [key: string]: string;
}): Promise<User> {
  let token: IDToken;

  if (!auth0_id_token) {
    throw new Error("no auth cookie provided");
  }
  token = await verify(auth0_id_token);

  const session = await getSession({ sid: token.sid });
  if (!session) {
    throw new Error("unable to find a matching, non-expired session");
  }

  const user = await getUserById(session.user_id);
  return user;
};

export {
  exchangeCode,
  getUserFromCookies,
  redirectToLogin,
  redirectToLogout,
  verify,
};
