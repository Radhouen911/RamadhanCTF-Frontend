/// <reference types="vite/client" />

import challengesJson from "../../Ramadan CTF.2026-03-16_16_02_07/db/challenges.json";
import solvesJson from "../../Ramadan CTF.2026-03-16_16_02_07/db/solves.json";
import teamsJson from "../../Ramadan CTF.2026-03-16_16_02_07/db/teams.json";
import usersJson from "../../Ramadan CTF.2026-03-16_16_02_07/db/users.json";

import type { User } from "../app/context/AuthContext";

// Only keep static archive implementation
// Only keep static archive implementation

class CTFdAPI {
  challenges: any[] = challengesJson.results;
  teams: any[] = teamsJson.results;
  users: User[] = usersJson.results;
  solves: any[] = solvesJson.results;

  async getChallenges() {
    return { success: true, data: this.challenges };
  }

  async getChallenge(id: number) {
    const found = this.challenges.find((c) => c.id === id);
    return { success: !!found, data: found };
  }

  // Scoreboard: build from teams and solves
  async getScoreboard() {
    // Example: return teams sorted by number of solves (descending)
    const scoreboard = this.teams
      .map((team) => ({
        ...team,
        solves: this.solves.filter((s) => s.team_id === team.id),
        score: this.solves.filter((s) => s.team_id === team.id).length,
      }))
      .sort((a, b) => b.score - a.score);
    return { success: true, data: scoreboard };
  }

  async getScoreboardTop(count = 10) {
    const scoreboard = (await this.getScoreboard()).data;
    return { success: true, data: scoreboard.slice(0, count) };
  }

  async getTeams() {
    return { success: true, data: this.teams };
  }

  async getTeam(id: number) {
    const found = this.teams.find((t) => t.id === id);
    if (!found) return { success: false, data: null };

    // Build members list from users and compute individual scores from solves
    const members = this.users
      .filter((u: any) => u.team_id === id)
      .map((u: any) => {
        const memberSolves = this.solves.filter((s) => s.account_id === u.id);
        const memberScore = memberSolves.reduce(
          (sum, s) => sum + (s.value ?? 1),
          0,
        );
        return {
          id: u.id,
          name: u.name || u.username || "Unknown",
          email: u.email || null,
          score: memberScore,
        };
      });

    // Compute team score (sum of member scores) and include members
    const teamScore = members.reduce((sum, m) => sum + (m.score ?? 0), 0);

    return {
      success: true,
      data: {
        ...found,
        members,
        score: found.score ?? teamScore,
      },
    };
  }

  async getCurrentUser() {
    // Archive mode: no auth, return null
    return { success: false, data: null };
  }

  async getUser(id: number) {
    const found = this.users.find((u) => u.id === id);
    return { success: !!found, data: found };
  }

  async getUserSolves(id: number) {
    const solves = this.solves.filter((s) => s.account_id === id);
    return { success: true, data: solves };
  }

  async getTeamSolves(id: number) {
    const solves = this.solves.filter((s) => s.team_id === id);
    return { success: true, data: solves };
  }

  // Add more static methods as needed for awards, configs, etc.
}

export const ctfdApi = new CTFdAPI();
