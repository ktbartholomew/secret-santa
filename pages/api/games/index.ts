import { NextApiRequest, NextApiResponse } from "next";
import { getUserFromCookies } from "../../../lib/auth0";
import { createGame, Game } from "../../../lib/games";
import { User } from "../../../lib/user";

const adjectives = [
  "abundant",
  "angelic",
  "awake",
  "biodegradable",
  "bright",
  "brilliant",
  "brisk",
  "cheerful",
  "cheery",
  "chilly",
  "colorful",
  "dazzling",
  "dear",
  "delicate",
  "delightful",
  "early",
  "elaborate",
  "evergreen",
  "expensive",
  "fast",
  "favorite",
  "fancy",
  "freezing",
  "fragile",
  "grand",
  "good",
  "glittering",
  "glistening",
  "gleaming",
  "giving",
  "happy",
  "harmonious",
  "hushed",
  "hopeful",
  "handmade",
  "illuminating",
  "incandescent",
  "joyful",
  "jubilant",
  "kind",
];

const nouns = [
  "angel",
  "antler",
  "bell",
  "candy",
  "carol",
  "chestnut",
  "chimney",
  "eggnog",
  "elf",
  "elves",
  "family",
  "feast",
  "frost",
  "fruitcake",
  "garland",
  "gift",
  "goose",
  "holly",
  "light",
  "misteltoe",
  "night",
  "ornament",
  "present",
  "pudding",
  "party",
  "pine",
  "reindeer",
  "santa",
  "snow",
  "snowflake",
  "star",
  "stocking",
  "tinsel",
  "tradition",
  "tree",
  "turkey",
];

const generateJoinKey = (): string => {
  let adj1 = adjectives[Math.floor(Math.random() * adjectives.length)];
  let noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj1}-${noun}`;
};

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getUserFromCookies(req.cookies);
    const game = await createGame({
      name: req.body.name,
      description: req.body.description,
      price_description: req.body.price_description,
      join_key: generateJoinKey(),
      user,
    });
    res.status(202);
    res.send(game);
    return;
  } catch (e) {
    console.error(e);
    res.status(403);
    res.send(e);
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
