# Island Survival

**Current shared entry:** [START-HERE.md](START-HERE.md) — PC/Android workflow, current Cooper West browser source, playtest and asset links.

The runnable browser terrain preview now lives in `browser/cooper-west/`. The older Godot status below is retained as historical context; Mobile Test 08 and the complete Godot source have not been imported.

Local checks: `npm test`, `npm run build`. Local hub: `npm start` (port 8790). GitHub Actions tests and publishes the playtest after changes reach main.

A Godot survival game built around physical crafting and an AI teammate sharing the same world and rules.

Find the right stone, strike it in the right place, choose a suitable branch, carve it, bind the pieces, and test the resulting tool. Materials and handling should matter.

## Start here

- [Continuity and working plan](docs/CONTINUITY.md): design decisions, build history, evidence, open questions and next-session handoff.
- [Work queue](https://github.com/Ewanc76/IslandSurvival/issues): prioritized tasks and acceptance criteria.
- [Contributor instructions](AGENTS.md): boundaries and workflow for coding sessions.

## Current status

The current source candidate is **Island-Survival-Sol-Chat-Recovery-v17.zip**. This repository currently contains the project notes and task tracking; the game source import is pending in issue #1. The first download attempt could not reach the transfer service. Launch instructions will be added after the actual source is imported and checked.

Earlier playtests demonstrated forest audio transitions and Sol gathering sticks into a pile. Post-v17 live chat-recovery validation is still pending. Chat-history trimming and restart-persistent memory are separate milestones.

## Near-term plan

1. Import and verify v17 source.
2. Validate chat recovery and branch gathering.
3. Preserve game orientation and experience across restarts.
4. Improve task continuity, teamwork and bounded exploration.
5. Build the first physical stone-shaping experiment.

The initial crafting slice is **find stone -> shape -> choose stick -> carve -> bind -> swing**. Broader survival systems and remote multiplayer follow later.

## Development practices

Use small, reviewable changes. Record automated checks and live playtests separately. Keep API credentials, personal logs, runtime memory and generated outputs out of version control. Historical ZIP builds remain outside this repository; source changes will be tracked here once imported.
