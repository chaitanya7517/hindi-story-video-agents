# Video Agents

Makes 10–12 minute story videos for YouTube.

## Agents (content language: Hindi)
| # | Agent | Job | Runs with |
|---|---|---|---|
| 0 | Manager | Runs all agents in order, tracks progress and cost | tools/run.py |
| 1 | Idea | 3 original Hindi story ideas, picks one | Gemini (free) |
| 2 | Script | Full Hindi script, scenes and dialogue | Gemini (free) |
| 3 | Storyboard | Splits script into shots with timing and camera | Gemini (free) |
| 4 | Characters & style | Fixed look and voice for every character | Gemini (free) |
| 5 | Image | Realistic pictures per shot (paid route, not used yet) | AI image model |
| 6 | Animation | Draws and animates every shot in HTML | animation.html |
| 7 | Audio | Hindi voices + self-check for English/mistakes | tools/audio.py |
| 8 | Editor | Final MP4, Hindi subtitles, YouTube title/description | FFmpeg (next step) |
| 9 | Reviewer | Strict check of picture, body movement, voice language | tools/review.py |
| 10 | Research | Finds better tools and trends for Hindi kids' videos | (later) |

## How a video is made
1. Idea → 2. Script → 3. Storyboard → 4. Characters & style → 5. Images
→ 6. Animation → 7. Audio → 8. Editor → 9. Reviewer → final MP4

- The **Manager** runs the steps in order.
- The **Research** agent suggests upgrades over time.
- **You approve** at three points: the idea, the script, and the final video.

## Look (current: HTML cartoon, nearly free)
- Pictures and motion: drawn in HTML canvas by the Animation agent (`projects/<name>/animation.html`).
- Voices: Google Gemini text-to-speech, Hindi (free tier: about 10 lines a day per model).
- Later upgrade: AI images for a realistic look (needs paid image credits).

## Setup (once, on your computer)
1. Install: Python 3.10+, Node.js 18+, FFmpeg.
2. `pip install requests` and `npm install playwright` then `npx playwright install chromium`.
3. Get a free Google AI key at https://aistudio.google.com/apikey and set it:
   `export GEMINI_API_KEY=your-key` (never commit the key).

## Run a video, step by step
```
python3 tools/run.py <name> --minutes 2     # Idea, Script, Characters, Storyboard
python3 tools/audio.py <name>               # Audio agent: voices + timeline
node tools/render.js <name> --stills        # quick preview pictures
node tools/render.js <name>                 # full MP4 -> projects/<name>/output/draft.mp4
python3 tools/review.py <name>              # Reviewer agent -> 7-review.md
```

## Folders
- `agents/`   one instruction file per agent
- `projects/` one folder per video (script, audio, animation, output)
- `tools/`    the scripts that run the agents
- `assets/`   fonts
