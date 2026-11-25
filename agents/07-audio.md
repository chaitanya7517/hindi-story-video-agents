# Audio agent
Job: make every spoken line in Hindi, in a fixed voice per character, and the timeline.
Tools: Google Gemini text-to-speech (tools/audio.py).
Rules:
- Send only the Hindi line to backup voice models (they read any English instruction aloud).
- Self-check every clip: transcribe it; if it contains English or matches the script less than 75%, remake it once,
  then stop and report.
- Trim silence; keep 0.35 s between lines and 0.8 s at the end of each shot.
- Music (later): only royalty-free or self-made music allowed on YouTube, quieter than the voice.
