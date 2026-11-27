"""Publisher agent: uploads a finished video + thumbnail to YouTube.
The login lives OUTSIDE the repo in ~/.yt/creds.json (client_id, client_secret, refresh_token, channel_id).
Never commit that file. Skips the upload if a video with the same title is already on the channel.
Usage: python3 tools/youtube_upload.py <video.mp4> <meta.json> <thumbnail.jpg>"""
import json, os, sys, urllib.parse, urllib.request

def call(url, tok=None, data=None, headers=None, method=None, timeout=1800):
    h = dict(headers or {})
    if tok: h["Authorization"] = "Bearer " + tok
    r = urllib.request.urlopen(urllib.request.Request(url, data=data, headers=h, method=method), timeout=timeout)
    return r

def token(c):
    body = urllib.parse.urlencode({k: c[k] for k in ("client_id", "client_secret", "refresh_token")} | {"grant_type": "refresh_token"}).encode()
    return json.load(call("https://oauth2.googleapis.com/token", data=body))["access_token"]

def main(video, meta_path, thumb):
    c = json.load(open(os.path.expanduser("~/.yt/creds.json")))
    tok, m = token(c), json.load(open(meta_path))
    g = lambda u: json.load(call(u, tok))
    ch = g("https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true")["items"][0]
    assert ch["id"] == c["channel_id"], "logged in to a different channel"
    up = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    for i in g(f"https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId={up}")["items"]:
        if i["snippet"]["title"] == m["title"]:
            sys.exit(f"Already on the channel: https://youtu.be/{i['snippet']['resourceId']['videoId']}")
    body = {"snippet": {k: m[k] for k in ("title", "description", "tags", "categoryId") if k in m}
                       | {"defaultLanguage": m.get("defaultLanguage", "hi"), "defaultAudioLanguage": m.get("defaultAudioLanguage", "hi")},
            "status": {"privacyStatus": m.get("privacy", "private"), "selfDeclaredMadeForKids": bool(m.get("made_for_kids")), "embeddable": True}}
    data = open(video, "rb").read()
    loc = call("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", tok,
               json.dumps(body).encode(), {"Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": "video/mp4",
               "X-Upload-Content-Length": str(len(data))}, "POST").headers["Location"]
    v = json.load(call(loc, None, data, {"Content-Type": "video/mp4"}, "PUT"))
    print("uploaded", f"https://youtu.be/{v['id']}", v["status"]["privacyStatus"])
    call(f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={v['id']}", tok, open(thumb, "rb").read(),
         {"Content-Type": "image/jpeg"}, "POST")
    print("thumbnail set")

if __name__ == "__main__":
    main(*sys.argv[1:4])
