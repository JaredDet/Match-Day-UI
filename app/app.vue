<script setup lang="ts">
import { StarIcon } from "@heroicons/vue/24/outline";
const route = useRoute();
const favoritesOnly = useState("matchday-favorites-only", () => false);
async function showHome(onlyFavorites: boolean) {
  favoritesOnly.value = onlyFavorites;
  await navigateTo("/");
}
</script>
<template>
  <div class="site-shell">
    <NuxtRouteAnnouncer />
    <header class="header">
      <NuxtLink class="brand" to="/" aria-label="Matchday, inicio">
        <span class="brand-icon">m<span>↗</span></span>
        matchday<span class="brand-dot">.</span>
      </NuxtLink>
      <nav aria-label="Navegación principal">
        <button
          :class="{ active: route.path === '/' && !favoritesOnly }"
          @click="showHome(false)"
        >
          Partidos
        </button>
        <button
          :class="{ active: route.path === '/' && favoritesOnly }"
          @click="showHome(true)"
        >
          Mis favoritos
          <AnimatedHeroIcon
            :icon="StarIcon"
            motion="pop"
            class="ui-icon nav-star"
            aria-hidden="true"
          />
        </button>
      </nav>
    </header>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    <footer>
      <NuxtLink class="brand" to="/">
        matchday<span class="brand-dot">.</span>
      </NuxtLink>
      <span>Hecho para quienes viven el fútbol.</span>
      <span>EL PARTIDO EMPIEZA AQUÍ ↗</span>
    </footer>
  </div>
</template>
<style>
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap");
:root {
  color-scheme: dark;
  font-family: "DM Sans", sans-serif;
  color: #eceef2;
  background: #0b0d11;
  font-synthesis: none;
  --surface: #13161c;
  --border: #252932;
  --muted: #9299a6;
  --accent: #bded75;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
button,
input {
  font: inherit;
}
button,
a {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
button {
  cursor: pointer;
  color: inherit;
  background: none;
  border: 0;
}
a {
  color: inherit;
  text-decoration: none;
}
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
button:hover {
  color: var(--accent);
}
h1,
h2,
h3,
h4,
p {
  margin: 0;
}
html {
  scroll-behavior: smooth;
  scroll-padding-top: 24px;
}
.header {
  height: 80px;
  padding: 0 44px;
  display: flex;
  align-items: center;
  gap: 70px;
  border-bottom: 1px solid var(--border);
  background: #0f1116;
}
.brand {
  display: flex;
  align-items: center;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -1.4px;
}
.brand-dot {
  color: var(--accent);
}
.brand-icon {
  background: var(--accent);
  color: #10160c;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  font-size: 24px;
  font-style: italic;
  line-height: 25px;
  text-align: center;
  position: relative;
  margin-right: 10px;
}
.brand-icon span {
  display: none;
}
.header nav {
  display: flex;
  gap: 32px;
  align-self: stretch;
}
.header nav button {
  font-size: 13px;
  color: var(--muted);
  position: relative;
  padding: 0 3px;
}
.header nav button.active {
  color: #fff;
}
.header nav button.active:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
}
.nav-star {
  margin-left: 8px;
  font-size: 18px;
}
.header-note {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 11px;
}
.green-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}
main {
  max-width: 1280px;
  padding: 0 44px;
  margin: auto;
}
.intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 47px 0 37px;
}
.eyebrow {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--accent);
}
h1 {
  font-size: 42px;
  font-weight: 600;
  letter-spacing: -1.8px;
  margin: 10px 0;
}
h1 > span {
  color: var(--accent);
}
.intro p {
  font-size: 13px;
  color: var(--muted);
}
.live-summary {
  display: flex;
  align-items: center;
  gap: 11px;
  border: 1px solid #35422c;
  background: #161e14;
  padding: 14px 18px;
  border-radius: 8px;
  font-size: 11px;
  color: #b6c7a5;
}
.live-summary strong {
  font-size: 22px;
  color: var(--accent);
  font-family: "Barlow Condensed", sans-serif;
}
.live-summary > span:last-child {
  margin-left: 15px;
  font-size: 19px;
  color: var(--accent);
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 21px;
}
h2 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.count {
  font-size: 10px;
  padding: 3px 6px;
  background: #1d2129;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 5px;
  letter-spacing: 0;
}
.search {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  background: #101218;
  border-radius: 6px;
  padding: 10px 12px;
  width: 250px;
}
.search svg {
  width: 16px;
  height: 16px;
  color: #79818f;
}
.search input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: none;
  color: #eceef2;
  font-size: 11px;
  outline: none;
}
.search input::placeholder {
  color: #7e8593;
}
.search kbd {
  color: #69717e;
  font-size: 12px;
}
.calendar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 9px;
}
.month-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 173px;
}
.calendar-symbol {
  font-size: 23px;
  color: #8f97a5;
}
.month-picker label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 9px;
  color: var(--muted);
}
.month-picker input {
  border: 0;
  background: none;
  font-size: 11px;
  color: #e0e4eb;
  max-width: 140px;
}
.date-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
}
.day {
  width: 55px;
  height: 59px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  position: relative;
}
.day:hover {
  background: #20252d;
}
.day span {
  font-size: 10px;
  text-transform: capitalize;
  color: #a0a7b3;
}
.day strong {
  font-size: 18px;
  font-weight: 500;
}
.day.selected {
  background: var(--accent);
  color: #1b2412;
}
.day.selected span {
  color: #3a492d;
}
.day i {
  position: absolute;
  bottom: 4px;
  width: 3px;
  height: 3px;
  background: currentColor;
  border-radius: 50%;
}
.arrow {
  padding: 8px;
  color: #8c94a2;
  font-size: 24px;
}
.today-button {
  font-size: 10px;
  color: var(--accent);
  white-space: nowrap;
}
.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  margin-top: 20px;
  gap: 15px;
}
.tabs {
  display: flex;
  gap: 24px;
}
.tabs button {
  padding: 13px 0 17px;
  position: relative;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #979eaa;
}
.tabs button.selected {
  color: #f4f6f9;
}
.tabs button.selected:after {
  content: "";
  position: absolute;
  bottom: -1px;
  height: 2px;
  background: var(--accent);
  left: 0;
  right: 0;
}
.tab-count {
  font-size: 9px;
  background: #26321d;
  color: var(--accent);
  padding: 2px 5px;
  border-radius: 4px;
}
.timezone {
  font-size: 9px;
  color: #7d8593;
}
.prototype-note {
  font-size: 9px;
  color: #757e8d;
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.prototype-note .green-dot {
  width: 4px;
  height: 4px;
  background: #757e8d;
}
.day-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0 16px;
}
.day-heading h3 {
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  color: #c9ced7;
}
.day-heading > span {
  font-size: 10px;
  color: #7d8593;
}
.match-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}
.match-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition:
    border-color 0.18s,
    background 0.18s;
}
.match-card:hover {
  border-color: #49515d;
  background: #161a21;
}
.match-card.is-live {
  border-top: 2px solid #91b95b;
}
.card-top {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 49px;
  padding: 12px 38px;
}
.match-status {
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8f98a6;
}
.match-status.live {
  color: var(--accent);
}
.match-status .green-dot {
  width: 5px;
  height: 5px;
  box-shadow: 0 0 8px #bded7522;
}
.favorite {
  position: absolute;
  right: 12px;
  top: 11px;
  font-size: 21px;
  padding: 3px;
  color: #737d8a;
  line-height: 1;
}
.favorite.saved {
  color: var(--accent);
}
.fixture {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 92px minmax(0, 1fr);
  align-items: start;
  gap: 2px;
  padding: 9px 15px 22px;
}
.team {
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  min-width: 0;
}
.crest {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  background: var(--team-color);
  color: #fff;
  border: 2px solid rgb(255 255 255 / 80%);
  border-radius: 5px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.5px;
  box-shadow: none;
}
.team h4 {
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  margin-top: 11px;
  max-width: 110px;
  color: #dce0e7;
}
.score {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 0;
  gap: 5px;
}
.score strong {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 43px;
  line-height: 1.15;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
}
.score em {
  font-size: 24px;
  font-style: normal;
  color: #626b79;
  font-weight: 400;
  vertical-align: 4px;
}
.match-card .score strong.kickoff {
  font-size: 22px;
  letter-spacing: 0;
  margin-top: 11px;
  transform: scaleY(1.15);
  transform-origin: center;
  color: #c2c9d4;
}
.score > span {
  font-size: 9px;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.scorers {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20px minmax(0, 1fr);
  gap: 9px;
  padding: 0 20px 20px;
  align-items: start;
}
.scorers ul {
  min-height: 38px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #8f98a7;
  font-size: 10px;
  line-height: 1.9;
}
.scorers-home {
  text-align: right;
}
.scorers-away {
  text-align: left;
}
.scorers li {
  overflow-wrap: anywhere;
}
.scorers li span {
  white-space: nowrap;
  color: #747f8e;
  font-variant-numeric: tabular-nums;
}
.scorers li.more-goals {
  color: var(--accent);
  font-size: 9px;
}
.goal-icon {
  display: block;
  width: 15px;
  height: 15px;
  margin: 2px auto 0;
  flex-shrink: 0;
}
.card-bottom {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #22262e;
  padding: 10px 15px;
}
.card-bottom button {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #a7b29c;
  font-size: 10px;
}
.card-bottom button:hover {
  color: var(--accent);
}
.card-bottom button > span {
  font-size: 16px;
}
.end-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  color: #747d8a;
  margin: 27px 0 46px;
}
.end-note .green-dot {
  width: 4px;
  height: 4px;
  background: #687b55;
}
.end-line {
  height: 1px;
  background: var(--border);
  flex: 1;
  margin-left: 8px;
}
.empty {
  text-align: center;
  background: var(--surface);
  border: 1px dashed #333b46;
  border-radius: 9px;
  padding: 48px 20px;
}
.empty-icon {
  font-size: 35px;
  color: var(--accent);
}
.empty h3 {
  font-size: 17px;
  margin: 12px 0;
}
.empty p {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.8;
}
.empty button {
  margin-top: 20px;
  background: var(--accent);
  color: #243018;
  border-radius: 5px;
  padding: 10px 14px;
  font-size: 11px;
}
footer {
  max-width: 1192px;
  margin: auto;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 25px 0 32px;
  color: #76808d;
}
footer .brand {
  font-size: 22px;
  color: #b2bac6;
}
footer > span {
  font-size: 10px;
}
footer > span:last-child {
  margin-left: auto;
  font-size: 8px;
  letter-spacing: 1.5px;
}
dialog {
  width: min(620px, calc(100% - 32px));
  border: 1px solid #36402e;
  border-radius: 12px;
  padding: 28px;
  background: #14181e;
  color: #e6eaf0;
  box-shadow: 0 20px 100px #0009;
}
dialog::backdrop {
  background: #030509c9;
  backdrop-filter: blur(6px);
}
.dialog-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dialog-top button {
  font-size: 27px;
  color: var(--muted);
}
dialog h2 {
  display: block;
  font-size: 24px;
  line-height: 1.5;
  margin: 13px 0;
}
.versus {
  margin: 0 10px;
  color: #687582;
  font-weight: 400;
}
dialog p {
  font-size: 12px;
  line-height: 1.8;
  color: var(--muted);
}
.detail-score {
  padding: 24px;
  margin: 23px 0;
  background: #1c2418;
  border: 1px solid #303e25;
  color: var(--accent);
  border-radius: 8px;
  text-align: center;
  font-size: 27px;
}
.detail-teams {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.detail-teams h3 {
  font-size: 13px;
  margin-bottom: 8px;
}
.detail-teams ul {
  padding: 0;
  list-style: none;
  font-size: 12px;
}
.detail-teams li {
  margin: 14px 0;
}
.detail-teams strong {
  float: right;
  color: #becba9;
}
.detail-assist {
  display: block;
  font-size: 10px;
  color: #899582;
  margin-top: 5px;
}
.detail-goal-type {
  font-size: 10px;
  color: #899582;
}
@media (min-width: 1450px) {
  main {
    max-width: 1360px;
  }
  .intro {
    padding-top: 55px;
    padding-bottom: 42px;
  }
  footer {
    max-width: 1272px;
  }
  .fixture {
    padding-top: 15px;
    padding-bottom: 26px;
  }
  .match-card .score strong {
    font-size: 46px;
  }
}
@media (max-width: 1050px) {
  .header {
    gap: 40px;
    padding: 0 30px;
  }
  main {
    padding: 0 30px;
  }
  .calendar {
    gap: 10px;
  }
  .month-picker {
    min-width: 155px;
  }
  .date-strip {
    gap: 4px;
  }
  .day {
    width: 43px;
  }
  .today-button {
    display: none;
  }
  .match-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  footer {
    margin: 0 30px;
  }
  .header-note {
    font-size: 10px;
  }
}
@media (max-width: 700px) {
  .header {
    height: 67px;
    padding: 0 20px;
    gap: 20px;
    justify-content: space-between;
  }
  .brand {
    font-size: 24px;
  }
  .brand-icon {
    width: 24px;
    height: 24px;
    font-size: 21px;
    line-height: 22px;
  }
  .header nav {
    gap: 19px;
  }
  .header nav button {
    font-size: 11px;
  }
  .header-note {
    display: none;
  }
  .nav-star {
    display: none;
  }
  main {
    padding: 0 18px;
  }
  .intro {
    padding: 30px 0 28px;
    gap: 18px;
    align-items: flex-start;
    flex-direction: column;
  }
  h1 {
    font-size: 34px;
    margin: 8px 0;
  }
  .eyebrow {
    font-size: 8px;
  }
  .intro p {
    font-size: 12px;
  }
  .live-summary {
    padding: 8px 12px;
    gap: 8px;
    font-size: 10px;
  }
  .live-summary strong {
    font-size: 18px;
  }
  .live-summary > span:last-child {
    font-size: 15px;
    margin-left: 7px;
  }
  .section-heading {
    gap: 12px;
    margin-bottom: 16px;
  }
  h2 {
    font-size: 19px;
  }
  .search {
    width: 170px;
    padding: 9px 10px;
  }
  .search input {
    font-size: 10px;
  }
  .search kbd {
    display: none;
  }
  .calendar {
    display: block;
    padding: 10px;
  }
  .month-picker {
    padding: 3px 6px 12px;
    border-bottom: 1px solid var(--border);
  }
  .month-picker label {
    flex-direction: row;
    align-items: center;
    gap: 15px;
  }
  .date-strip {
    padding-top: 9px;
    gap: 2px;
  }
  .day {
    flex: 1;
    min-width: 0;
    height: 54px;
  }
  .arrow {
    padding: 5px;
  }
  .filter-row {
    display: block;
    margin-top: 14px;
  }
  .tabs {
    justify-content: space-between;
    gap: 12px;
  }
  .tabs button {
    font-size: 10px;
    padding-bottom: 13px;
  }
  .timezone {
    display: none;
  }
  .day-heading {
    margin: 22px 0 14px;
  }
  .match-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .fixture {
    grid-template-columns: minmax(0, 1fr) 100px minmax(0, 1fr);
    padding: 10px 24px 23px;
  }
  .team h4 {
    font-size: 12px;
  }
  .score strong {
    font-size: 45px;
  }
  .scorers {
    padding: 0 26px 20px;
    gap: 12px;
  }
  .scorers ul {
    font-size: 11px;
  }
  .card-bottom {
    padding: 10px 19px;
  }
  .end-note {
    margin-bottom: 30px;
  }
  footer {
    margin: 0 18px;
    flex-wrap: wrap;
    gap: 12px;
  }
  footer > span:last-child {
    width: 100%;
    margin: 0;
  }
  .detail-teams {
    grid-template-columns: 1fr;
  }
  dialog {
    padding: 22px;
  }
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .match-card {
    transition: none;
  }
}
.score > span.penalty-score {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
  background: #bded7512;
  white-space: nowrap;
}
dialog .detail-penalties {
  color: var(--accent);
  text-align: center;
  margin: -10px 0 24px;
}
/* A restrained scoreboard surface keeps the match itself in focus. */
.match-card {
  border: 1px solid #303030;
  border-radius: 6px;
  background: #1c1c1c;
  box-shadow: none;
  transition: border-color 0.15s;
}
.match-card.is-live {
  border-top: 1px solid #303030;
}
.match-card:hover {
  border-color: #505050;
  background: #1c1c1c;
  box-shadow: none;
  transform: none;
}
.match-card .card-top {
  min-height: 53px;
}
.match-card .match-status {
  color: #aaa;
}
.match-card .match-status.live {
  color: #c6d8b5;
  background: none;
  border: 0;
  border-radius: 0;
  padding: 0;
  font-size: 10px;
}
.match-card .match-status .green-dot {
  background: #99b57f;
  box-shadow: none;
}
.match-card .card-bottom {
  border-top: 1px solid #ffffff0c;
  background: none;
  padding: 11px 17px;
}
.match-card .card-bottom button {
  color: #b1b1b1;
}
.match-card .card-bottom button:hover {
  color: #fff;
}
.match-card .card-bottom button > span {
  color: #909090;
}
@media (prefers-reduced-motion: reduce) {
  .match-card {
    transition: none;
  }
}
/* The entire fixture opens its details; the favorite remains an independent action. */
.match-card {
  position: relative;
}
.match-open {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  z-index: 1;
}
.match-open:focus-visible {
  outline: 2px solid #b3b8bf;
  outline-offset: 3px;
}
.match-card .favorite {
  z-index: 2;
}
.open-indicator {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: #858585;
  font-size: 14px;
  opacity: 0.55;
  transition: opacity 0.15s;
}
.match-open:hover .open-indicator,
.match-open:focus-visible .open-indicator {
  opacity: 1;
  color: #ddd;
}
.match-card:focus-within {
  border-color: #686868;
}
@media (prefers-reduced-motion: reduce) {
  .open-indicator {
    transition: none;
  }
}

.match-dialog {
  width: min(1060px, calc(100% - 32px));
  max-height: 92dvh;
  padding: 28px;
  background: #151515;
  border: 1px solid #393939;
  border-radius: 8px;
  overflow: auto;
  overscroll-behavior: contain;
}
.detail-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-toolbar h2 {
  margin: 0;
  font-size: 20px;
}
.detail-toolbar p {
  font-size: 10px;
}
.detail-toolbar button {
  font-size: 28px;
  width: 40px;
  height: 40px;
}
.detail-date {
  text-align: center;
  margin: 16px 0;
}
.detail-summary {
  max-width: 620px;
  margin: 0 auto 30px;
}
.detail-summary .fixture {
  grid-template-columns: 1fr 110px 1fr;
}
.detail-summary .scorers {
  max-width: 450px;
  width: 100%;
  margin: auto;
}
.detail-summary .team h4 {
  max-width: none;
}
.detail-summary .score strong {
  font-size: 43px;
}
@media (max-width: 700px) {
  .match-dialog {
    width: calc(100% - 16px);
    padding: 16px;
    max-height: 95dvh;
  }
  .detail-summary .fixture {
    padding-left: 10px;
    padding-right: 10px;
  }
  .detail-summary .team h4 {
    font-size: 11px;
  }
}

.ui-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  vertical-align: middle;
}
.inline-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
}
.ui-icon.nav-star {
  display: inline-block;
  margin-left: 8px;
}
.ui-icon.calendar-symbol {
  width: 22px;
  height: 22px;
}
.favorite .ui-icon {
  width: 20px;
  height: 20px;
}
.ui-icon.open-indicator {
  width: 15px;
  height: 15px;
}
.detail-toolbar button {
  display: grid;
  place-items: center;
}
.detail-toolbar .ui-icon {
  width: 24px;
  height: 24px;
}
.page-enter-active{transition:opacity .24s ease,transform .24s ease}
.page-leave-active{transition:opacity .14s ease}
.page-enter-from{opacity:0;transform:translateY(8px)}
.page-leave-to{opacity:0}
.match-grid .match-card{transition:transform .24s ease,border-color .24s ease,box-shadow .24s ease}
.match-grid .match-card:hover{transform:translateY(-3px);box-shadow:0 8px 20px #0003}
.match-grid .match-card:active{transform:translateY(-1px)}
</style>
