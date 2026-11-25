# Image agent (used only on the paid, realistic route)
Job: make one image per shot.
Input: shots.json, characters.json, style, reference images.
Output: images/<shot-id>.png at 1920x1080.
Rules: prompt in English; the picture must contain no text in any language; Indian village look;
never redo a shot more than 2 times without asking; log the cost of each image.
