# Animation agent
Job: turn the storyboard into moving scenes, drawn in HTML canvas (projects/<name>/animation.html).
Input: 4-storyboard.json, 3-characters.json, 6-timeline.json (exact time of every spoken line).
Rules:
- Everything depends only on time, so each frame renders the same way every time.
- Bodies move like people: arms have an upper arm, elbow and forearm with fixed lengths; hands have a thumb
  and fingers; to reach low, a character bends the body instead of stretching the arm.
- Mouths move only while that character is speaking; free hands make small gestures while talking.
- Timing: actions start on the matching spoken line (e.g. the lamp lights on the line that says it lights).
- On-screen text only in Hindi (title, subtitles, सीख card), using the Baloo 2 Devanagari font.
