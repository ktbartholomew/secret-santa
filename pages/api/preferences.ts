import { NextApiRequest, NextApiResponse } from "next";
import { getUserFromCookies } from "../../lib/auth0";
import { setUserName } from "../../lib/user";

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body.name) {
    res.status(400);
    res.end();
    return;
  }

  try {
    const user = await getUserFromCookies(req.cookies);
    await setUserName(user.id, req.body.name);
    res.status(202);
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500);
    res.send({ error: e });
    return;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  }

  res.status(405);
  res.end();
}
