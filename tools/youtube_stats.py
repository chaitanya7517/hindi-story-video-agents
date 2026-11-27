"""Tracker agent: reads the channel's subscribers, views, watch-time goal progress and each video's views/likes/comments.
Only READS from YouTube - never uploads or changes anything.
Usage: python3 tools/youtube_stats.py        -> prints a short report and adds today's numbers to research/stats.csv"""
import csv, datetime, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from youtube_upload import call, token
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://www.googleapis.com/youtube/v3/"

def main():
    c = json.load(open(os.path.expanduser("~/.yt/creds.json"))); tok = token(c)
    ch = json.load(call(API + "channels?part=statistics,contentDetails,snippet&mine=true", tok))["items"][0]
    st = ch["statistics"]; uploads = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    items = json.load(call(API + f"playlistItems?part=contentDetails&maxResults=50&playlistId={uploads}", tok))["items"]
    ids = ",".join(i["contentDetails"]["videoId"] for i in items)
    vids = json.load(call(API + f"videos?part=statistics,snippet&id={ids}", tok))["items"] if ids else []
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M")
    print(f"{ch['snippet']['title']}  ({now} UTC)")
    print(f"subscribers {st.get('subscriberCount', '?')} / 1000 needed | total views {st.get('viewCount')} | videos {st.get('videoCount')}")
    rows = []
    for v in vids:
        s = v["statistics"]; t = v["snippet"]["title"].split("|")[0].strip()
        print(f"  {s.get('viewCount', 0):>6} views  {s.get('likeCount', 0):>4} likes  {s.get('commentCount', 0):>3} comments  {t}  https://youtu.be/{v['id']}")
        rows.append([now, v["id"], t, s.get("viewCount", 0), s.get("likeCount", 0), s.get("commentCount", 0), st.get("subscriberCount")])
    p = os.path.join(ROOT, "research", "stats.csv"); new = not os.path.exists(p)
    with open(p, "a", newline="") as f:
        w = csv.writer(f)
        if new: w.writerow(["time_utc", "video_id", "title", "views", "likes", "comments", "channel_subscribers"])
        w.writerows(rows)

if __name__ == "__main__": main()
