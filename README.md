# InnerFrench listening companion

A static, mobile-friendly bilingual reader for episode 1. No build tools, API keys, accounts or external libraries are needed.

Open `index.html` to use it locally. Press play to highlight matching French and English passages. Tap a timestamp to play from that passage. Use Previous/Next, slower playback, Repeat passage, English visibility and Larger text to study. Disable Follow audio to browse freely; Find current passage returns to the audio. Listening position and reading preferences are saved in this browser.

## GitHub Pages

Keep `index.html`, `styles.css`, `app.js`, `transcript.js` and `episode1.mp3` together. The original transcript files and Python script are only needed to update the text.

- In this existing repository, commit and push the `innerfrench` folder. Enable GitHub Pages from the publishing branch and root folder in repository Settings → Pages. Open `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/innerfrench/`.
- For a separate repository, place these files at its root and use `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The audio is approximately 24 MB and is streamed from the same folder. An internet connection is required when hosted; this app does not provide offline downloads. Before making the audio and transcripts publicly available, ensure you have the necessary permission from their owner.

## Update the transcript

Edit `episode1` and `episode1_eng`, keeping their `[HH:MM:SS]` markers identical, then run `python innerfrench/build_transcript.py` from the parent directory. The opening paragraph starts at 0 seconds; each subsequent passage runs until the next timestamp, and the last runs to the end of the audio. Timing is paragraph-level, not word-level, and uses the timestamps supplied in the text.
