/**
 * Archive Data Loader
 * Loads static data from the /db JSON files for the archived CTF
 */

interface ArchiveTeam {
  id: number;
  name: string;
  score: number;
  place?: number | null;
  members_count?: number | null;
}

interface ArchiveSolve {
  id: number;
  challenge_id: number;
  user_id: number;
  team_id: number;
}

interface ArchiveChallenge {
  id: number;
  name: string;
  value: number;
  category: string;
  description: string;
  type?: string;
  files?: string[];
}

interface ArchiveUser {
  id: number;
  name: string;
  email: string;
  team_id: number | null;
  type: string;
  hidden: number;
  banned: number;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

interface TeamDetail {
  id: number;
  name: string;
  score: number;
  place: number | null;
  members: TeamMember[];
  solves: Array<{
    challenge_id: number;
    challenge_name: string;
    value: number;
    category: string;
  }>;
}

let cachedTeams: ArchiveTeam[] | null = null;
let cachedSolves: ArchiveSolve[] | null = null;
let cachedChallenges: ArchiveChallenge[] | null = null;
let cachedUsers: ArchiveUser[] | null = null;

async function loadJSON<T>(path: string): Promise<T | null> {
  try {
    // Use the base path from the router basename
    const basePath = "/RamadhanCTF-Frontend";
    const fullPath = basePath + path;
    const response = await fetch(fullPath);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to load ${path}:`, error);
    return null;
  }
}

export async function loadArchiveTeams(): Promise<ArchiveTeam[]> {
  if (cachedTeams) return cachedTeams;

  const data = await loadJSON<{ results: any[] }>("/db/teams.json");

  if (!data?.results) return [];

  // Filter out hidden teams and calculate scores
  const solves = await loadArchiveSolves();
  const challengeMap = new Map<number, ArchiveChallenge>();
  const challenges = await loadArchiveChallenges();
  challenges.forEach((c) => challengeMap.set(c.id, c));

  const teamScores = new Map<number, number>();
  solves.forEach((solve) => {
    const challenge = challengeMap.get(solve.challenge_id);
    if (challenge) {
      const current = teamScores.get(solve.team_id) || 0;
      teamScores.set(solve.team_id, current + challenge.value);
    }
  });

  const teams: ArchiveTeam[] = data.results
    .filter((t) => !t.hidden)
    .map((t) => ({
      id: t.id,
      name: t.name,
      score: teamScores.get(t.id) || 0,
      place: 0,
      members_count: null,
    }))
    .sort((a, b) => b.score - a.score)
    .map((t, idx) => ({ ...t, place: idx + 1 }));

  cachedTeams = teams;
  return cachedTeams;
}

export async function loadArchiveSolves(): Promise<ArchiveSolve[]> {
  if (cachedSolves) return cachedSolves;

  const data = await loadJSON<{ results: ArchiveSolve[] }>("/db/solves.json");

  cachedSolves = data?.results || [];
  return cachedSolves;
}

export async function loadArchiveChallenges(): Promise<ArchiveChallenge[]> {
  if (cachedChallenges) return cachedChallenges;

  const data = await loadJSON<{ results: any[] }>("/db/challenges.json");

  if (!data?.results) return [];

  cachedChallenges = data.results.map((c) => ({
    id: c.id,
    name: c.name,
    value: c.value || 0,
    category: c.category || "Misc",
    description: c.description || "",
    type: c.type,
    files: c.files || [],
  }));

  return cachedChallenges;
}

async function loadArchiveUsers(): Promise<ArchiveUser[]> {
  if (cachedUsers) return cachedUsers;

  const data = await loadJSON<{ results: any[] }>("/db/users.json");

  cachedUsers = data?.results || [];
  return cachedUsers;
}

export async function getTeamDetail(
  teamId: number,
): Promise<TeamDetail | null> {
  const teams = await loadArchiveTeams();
  const team = teams.find((t) => t.id === teamId);

  if (!team) return null;

  // Get team members
  const users = await loadArchiveUsers();
  const members = users
    .filter((u) => u.team_id === teamId && !u.hidden && !u.banned)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    }));

  // Get team solves
  const solves = await loadArchiveSolves();
  const challenges = await loadArchiveChallenges();
  const challengeMap = new Map<number, ArchiveChallenge>();
  challenges.forEach((c) => challengeMap.set(c.id, c));

  const teamSolves = solves
    .filter((s) => s.team_id === teamId)
    .map((s) => {
      const challenge = challengeMap.get(s.challenge_id);
      return {
        challenge_id: s.challenge_id,
        challenge_name: challenge?.name || "Unknown",
        value: challenge?.value || 0,
        category: challenge?.category || "Misc",
      };
    });

  return {
    id: team.id,
    name: team.name,
    score: team.score,
    place: team.place || null,
    members,
    solves: teamSolves,
  };
}

export async function getArchiveScoreboard() {
  const teams = await loadArchiveTeams();
  return {
    success: true,
    data: teams.map((t) => ({
      account_id: t.id,
      name: t.name,
      score: t.score,
      place: t.place,
    })),
  };
}
