# Texture-card comparison — October 25, 2026

A separate foliage A/B viewer now compares the same tree form and lighting with polygon leaves versus baked color/alpha/normal cards. It offers tile sizes, tree counts and a matched camera benchmark; no performance result is claimed. The island's production foliage remains polygons. See FOLIAGE-BAKE-TEST.md. Human phone/WebGL review pending.

---

# Canopy revision 03 — October 25, 2026

The review candidate fixes trunk/crown alignment and uses actual rendered twig-cluster footprints for static tree shade while retaining palm-neighbour competition. Seventeen checks/build pass. One paired 36.5-year run reproduced the screenshot baseline exactly, but candidate palms rose slightly (4,398 vs 4,275); shade alone has not solved density or the technical ceiling. Other species' root/soil demands remain unmodelled. No new phone FPS claim. Details/results: LIVING-ISLAND.md and docs/experiments/canopy-comparison.json. Main/Pages remain unchanged.

---

# LOD revision 02 — October 24, 2026

Ewan reports steady 30 FPS on living-island v01, with a noticeable 100× ecology hitch and the earlier foliage absent. The review branch now restores Mobile Test 08 branch-following foliage and adds geometry LODs for canopy, palms, coconuts and crabs. Full details and limits are in LIVING-ISLAND.md. Fifteen automated checks/build pass; new phone/WebGL validation remains pending. Main/Pages remain unchanged.

---

# Living island candidate — October 24, 2026

Cooper West now has an integration candidate with living palms, husked coconuts and coconut crabs. See [LIVING-ISLAND.md](LIVING-ISLAND.md) for scope, controls and validation. This is prepared browser source; it has not been merged or deployed, and phone/browser validation remains pending. The Godot build is unchanged.

---

# Current shared development — 20 October 2026

Read [START-HERE.md](../START-HERE.md) first. It is the short, current PC/Android handoff. The standalone Cooper West terrain preview has source, height data and tests in this repo. User PC playtest passed (60 FPS shown); physical Android performance remains pending. Mobile Test 08 source and full Godot game source are not imported.

The text below is historical Godot continuity from 11 October and must not be treated as the current browser status.

---

# Island Survival - continuity and working plan

Updated: 11 October 2026, America/New_York. This is the project entry point for future sessions. Update this document as decisions and test results change.

## Read this first

- Current build candidate: **Island-Survival-Sol-Chat-Recovery-v17.zip**.
- Latest explicitly successful branch-gathering report: v15-era testing; Ewan reported Sol retrieving sticks to a pile. Do not promote v17 to a fully playtested baseline until its chat recovery is checked in-game.
- Latest uploaded failure log: **session-log(20261011-035841).jsonl**, preceding the v17 fix.
- Immediate next work: validate v17 conversation recovery, then implement restart-persistent game memory with clear separation from temporary chat history.
- Game goal: a convincing, rewarding first 30 minutes of physical crafting. Companion work supports that goal.
- Prior API design: **Island-Survival-Sol-API-v01.md**. Its v04 implementation-status section is historical. Its authority/perception principles remain useful; do not mistake proposed tools for implemented ones.

## Vision and settled decisions

Ewan's manifesto: crafting should come from physically understanding and handling materials. Find the right rock, strike it in the right place, choose and carve a suitable stick, bind the pieces correctly, and try the resulting tool. A recipe click must not substitute for that process.

The setting is a fictional tropical island inspired by Palmyra. The shipwreck premise is about choosing to survive and experiment, rather than pursuing rescue. The scenario began with a satellite phone and limited pocket supplies, including a Bic lighter; exact starting inventory remains to be finalized.

The initial crafting slice is **find stone -> shape -> choose stick -> carve -> bind -> swing**. Hunger, fishing, shelter construction, weather systems, and an elaborate inventory remain outside that initial slice. Discussing a shelter site is a teamwork experiment, not authorization to expand the construction scope.

The prototype uses Godot 4. Established visual direction: clean low-poly geometry, dense layered tropical vegetation, and a strong beach-to-forest transition. Ewan may contribute 3D models. Pisonia and naupaka inform the vegetation; unsuitable wood and other misleading materials can reward careful inspection. Tree appearance currently must not be treated as proof of simulated material strength.

Sol is intended to share the world as a second character: limited perception, ordinary movement, ordinary reach, and the same interaction rules as Ewan. No privileged world knowledge or teleportation. Failure, observation, and discovery are part of the collaboration. Gaze direction matters. API integration is the chosen approach.

## Evidence and current state

This housekeeping pass checked the current project file inventory and read the original API design. Recent implementation details below come from development conversation records and Ewan's reports. The v17 source archive was not inspected or run during this pass. The latest log could not be read through the available text extraction; its contents are not diagnosed here.

| Area | Current evidence | What still needs checking |
| --- | --- | --- |
| Beach and forest | Ewan reported smooth running and a good sound fade between shoreline and forest | Recheck after changes that affect movement or audio |
| Branch handling | v04 introduced inspectable, pickup/rotate/place branches; later Ewan saw Sol bring sticks to a pile | Full current action contract and persistence need source inspection |
| API companion | Live sessions and uploaded logs exist; v07 onward tracks integration and recovery | Do not describe the original v01 design as the current implementation |
| Teamwork | Ewan explicitly reported successful stick gathering | Repeat using a fixed task and record completion/failure |
| Perception | Ewan tested a pile roughly 80-90 m away; Sol could not find it. Recorded working range is 30 m | Treat this as a perception boundary, not a confirmed bug; verify gaze/occlusion behavior separately |
| Chat history | v16 was reported to retain six recent exchanges plus compact older notes | Verify preservation of names, goals, corrections, and action outcomes through trimming |
| Chat recovery | v17 was reported to allow 1,200-character replies and request shorter oversized replies; 17 adapter/game checks were reported passing | Ewan's post-v17 live confirmation is still pending |
| Cost controls | Recent development records report a $1 session allowance and 30-call cap | Verify settings and enforcement in the current bridge; estimates are not billed totals |
| Exploration | Recent records describe tools centered on branches, pile markers, and nearby interactions | General exploration needs a deliberate movement/perception capability review; existing branch travel does not prove arbitrary exploration |
| Persistent memory | Chat trimming is reported; restart-persistent game memory is not established by available evidence | Confirm existing save behavior before implementing a new store |
| Physical crafting | Manifesto and slice are agreed | Stone shaping, carving, binding, and tool performance are planned, not confirmed implemented |
| Remote multiplayer | Original design separates a local two-character proof from networking | No claim of completed remote networking |

## Recommended work queue

These are proposed priorities, not newly completed features. Keep one primary implementation task active at a time.

| Priority | Task | Completion evidence |
| --- | --- | --- |
| P0 | Validate v17 chat recovery | A normal chat, a deliberately long-answer prompt, and a return to branch gathering all finish without a stuck speech state; log failures if any |
| P1 | Audit and add persistent game continuity | After a clean restart, Sol retains a compact orientation and learned notes; live pose, held items, and current object state come from the game rather than stale memory |
| P1 | Verify task continuity through trimming | A goal and a user correction survive more than six exchanges; completed and failed actions remain distinguishable; an abandoned task is not resumed |
| P2 | Make current teamwork reliable | A repeatable visible-branch-to-visible-pile task completes, or produces a concrete failure and sensible recovery; completion claims match physical results |
| P2 | Review exploration and remembered locations | Sol can approach a known/remembered location within a bounded task, reacquire observations, and report blockage or an absent target without claiming to see it remotely |
| P3 | Return to the first crafting interaction | Implement one observable stone-shaping experiment with meaningful material/strike feedback before building the entire crafting chain |
| Later | Expand the slice and consider remote multiplayer | Add carving, binding, and tool use incrementally once the preceding physical interactions work |

## Three separate kinds of continuity

**Development continuity:** this document, source/build versions, decisions, issues, and test evidence. It lets a fresh chat resume the project accurately.

**In-game orientation:** a short explicit description of Ewan, Sol's collaborative role, the island premise, and the rules the character must follow. An API session does not automatically inherit this ChatGPT conversation.

**In-game experience:** saved observations, experiments, outcomes, user corrections, and unfinished tasks. Keep this separate from the rolling conversation window. Trimming chat controls prompt growth; it does not by itself establish durable memory.

Proposed memory record fields: world/save identity, observation or event, timestamp, source, confidence, last-seen location when relevant, and task status. Record observed facts separately from inference. A remembered pile position is a last-seen location, not proof the pile is still there. Do not reuse session object IDs across unrelated worlds.

Load durable notes with bounded size. Validate live state from Godot. Test a clean restart, a moved object, a new world, and an explicitly cancelled task. Decide whether world objects themselves need persistence before claiming that remembering their positions constitutes a complete save system.

## Architecture boundaries to preserve

- Godot owns physics, collision, perception filtering, reach checks, object ownership, and authoritative action results.
- The local bridge owns credentials, model requests, event scheduling, request limits, and budget enforcement.
- Sol's decision layer chooses from the actually exposed tools and responds to their outcomes.
- Local movement can continue while inference waits; model calls should be driven by meaningful events rather than frames.
- Accepted or running actions are not completed actions. Retries must not cause duplicate pickup/place actions.
- A pause, cancellation, replay, or world change must not allow stale commands to execute.
- Keep credentials out of builds, handoffs, and session exports.

These are design requirements inherited from the original API note. Verify current enforcement in source when changing the relevant system.

## Build and evidence index

Files currently reside under **Island Survival**. This pass leaves the existing build and log files in place. A build title identifies a milestone; it does not prove every implied feature passed testing.

| Version | Archive | Role |
| --- | --- | --- |
| v01 | Island-Survival-Beach-v01.zip | Original beach milestone |
| v02-v03 | Island-Survival-Forest-v02.zip; Island-Survival-Forest-v03.zip | Forest and audio transition milestones |
| v04 | Island-Survival-Branches-v04.zip | Branch-handling foundation; basis of original API design |
| v05 | Island-Survival-Sol-Body-v05.zip | Companion body milestone |
| v06 | Island-Survival-Sol-Survivor-v06.zip | Companion appearance milestone |
| v07 | Island-Survival-Sol-Connected-v07.zip | API connection milestone |
| v08 | Island-Survival-Sol-Teamwork-v08.zip | Teamwork milestone |
| v09 | Island-Survival-Sol-Recovery-v09.zip | Recovery iteration |
| v10 | Island-Survival-Sol-Route-Recovery-v10.zip | Route recovery iteration |
| v11 | Island-Survival-Sol-Chat-v11.zip | Chat milestone |
| v12 | Island-Survival-Sol-Chat-History-v12.zip | Chat history milestone |
| v13 | Island-Survival-Sol-Sand-Drawing-v13.zip | Sand drawing milestone |
| v14 | Island-Survival-Sol-Chat-Fix-v14.zip | Chat fix iteration |
| v15 | Island-Survival-Sol-One-Dollar-v15.zip | Budget-control iteration; successful gathering reported in this period |
| v16 | Island-Survival-Sol-Trimmed-History-v16.zip | Compact-history iteration |
| v17 | Island-Survival-Sol-Chat-Recovery-v17.zip | Current candidate; post-fix live confirmation pending |

Additional evidence: session-log.jsonl; session-log(1).jsonl through session-log(10).jsonl; session-log(20261011-035841).jsonl. Screenshots: image.png, image(1).png, image(2).png, image(3).png. Original architecture reference: Island-Survival-Sol-API-v01.md.

Do not delete older builds or logs during routine housekeeping. Preserve a confirmed working build when promoting a new candidate. For future logs, prefer a timestamp plus build number; leave existing filenames intact.

## Lightweight release routine

1. Begin from the exact candidate named here, not whichever ZIP is easiest to find.
2. Read its README/changelog and relevant source before changing behavior.
3. Make one bounded change; avoid broad rewrites while recovering a working system.
4. Run checks appropriate to that change. Use a fake/offline agent for contract checks when practical; live calls are for behavior that needs them.
5. Package a new numbered build with a short change note, checks performed, and unresolved issues.
6. Record Ewan's actual playtest result separately from automated checks. Promote a build only on relevant evidence.
7. Update the current candidate, open issues, and next action in this document.

Suggested playtest record:

| Date / build | Task or trigger | Expected result | Observed result | Log | Status |
| --- | --- | --- | --- | --- | --- |
| Next session / v17 | Long reply, then gather a branch | Chat recovers; gathering still works | Pending | Pending | Open |

## Next-session handoff

Start with Island-Survival-Sol-Chat-Recovery-v17.zip. Check chat recovery and branch gathering before adding features. Then inspect current memory/save behavior and implement a small restart-persistent orientation/experience store if absent. Preserve limited perception, shared physical rules, the existing cost controls, and the first-30-minutes crafting scope. Do not assume v16 chat trimming is durable memory or that original API design tools are all implemented. Update this handoff after testing.

## Sources and verification limits

- Current Island Survival file inventory checked on 11 October 2026: archives v01-v17, original API design, logs, and screenshots.
- Island-Survival-Sol-API-v01.md read in full for original architecture and v04 limitations.
- Ewan's visible project conversation: successful forest transition, successful stick collection, perception-range experiment, and request for housekeeping.
- Retrieved development conversation records: original slice constraints, companion principles, v16 history policy, v17 recovery details, and recent reported checks.
- No new game tests, source modifications, log diagnosis, artifact moves, or deletions were performed in this housekeeping pass.

