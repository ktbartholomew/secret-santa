import { UserGameRow } from ".";

function _shuffle(players: UserGameRow[]): UserGameRow[] {
  let candidates = players.map((p) => p.user_id);

  for (const player of players) {
    // The player cannot be assigned to themselves, or to anybody in their
    // exclusion list
    let playerCandidates = candidates.filter((c) => {
      return player.user_id !== c && !player.exclusions.includes(c);
    });

    // Sometimes we run out of eligible candidates and need to start over
    if (playerCandidates.length === 0) {
      throw new Error("no eligible candidates left for player");
    }

    // Give the player a random assignee from those left, and remove the
    // assignee from the list ofo available candidates
    player.assignee =
      playerCandidates[Math.floor(Math.random() * playerCandidates.length)];

    candidates.splice(candidates.indexOf(player.assignee), 1);
  }

  return players;
}

export function setAssignees(players: UserGameRow[]): UserGameRow[] {
  for (let i = 0; i < 50; i++) {
    try {
      console.log("attempting to shuffle players");
      return _shuffle(players);
    } catch (e) {
      console.warn(e);
      continue;
    }
  }

  throw new Error(
    "unable to shuffle players and satisfy all exclusions after 50 attempts"
  );
}
