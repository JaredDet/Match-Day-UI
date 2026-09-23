import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the repository plugin composes every backend module", async () => {
  const source = await read("app/plugins/repositories.ts");
  for (const repository of [
    "ApiMatchRepository",
    "ApiNewsRepository",
    "ApiRecommendationRepository",
    "ApiTeamRepository",
    "ApiTournamentRepository",
  ]) {
    assert.match(source, new RegExp(`new ${repository}\\(`));
  }
});

test("the HTTP client sends cookies and CSRF", async () => {
  const source = await read("app/core/api/http-client.ts");
  assert.match(source, /credentials: "include"/);
  assert.match(source, /X-CSRFToken/);
});

test("public and management views do not import demo repositories", async () => {
  const paths = [
    "app/modules/matches/views/MatchListView.vue",
    "app/modules/matches/views/MatchDetailView.vue",
    "app/modules/matches/views/MatchManagementView.vue",
    "app/modules/news/views/NewsListView.vue",
    "app/modules/news/views/NewsManagementView.vue",
    "app/modules/teams/views/TeamListView.vue",
    "app/modules/teams/views/TeamManagementView.vue",
    "app/modules/tournaments/views/TournamentListView.vue",
    "app/modules/tournaments/views/TournamentManagementView.vue",
  ];
  for (const path of paths) assert.doesNotMatch(await read(path), /useDemo/);
});

test("recommendation tracking sends detail visits and active time", async () => {
  const source = await read("app/modules/recommendations/composables/useNavigationTracking.ts");
  assert.match(source, /repository\.visit/);
  assert.match(source, /repository\s*\.\s*heartbeat/);
  assert.match(source, /15_000/);
});
