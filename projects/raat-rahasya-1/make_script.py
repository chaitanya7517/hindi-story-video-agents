"""Episode 1 of the series "दादी के गाँव की रहस्यमयी रातें": आधी रात को आम के बाग़ में पायल किसकी?
Every shot = one picture (FLUX) + 1-3 spoken lines. Pictures keep to 1-2 main characters so faces stay right.
Writes 1-idea.json, 2-script.json, 3-characters.json, 4-storyboard.json, prompts.json, motion.json."""
import json
V = "projects/kuber-ganesh/voices/"
CH = {
 "Dadi":   ("दादी", V + "dadi.wav", "त्योहार आने वाला था और उसके पापा दिन-रात मिट्टी के दीये बना रहे थे। पापा बहुत थक गए थे।",
            "a kind 70-year-old Indian grandmother with white hair in a bun, round gold glasses, cream cotton saree with a maroon border"),
 "Monu":   ("मोनू", V + "monu.wav", "यह छोटा दीया मेरे पापा की मदद करेगा। इसमें मेरा बहुत सारा प्यार है!",
            "Monu, a 10-year-old Indian boy with short messy black hair, yellow half-sleeve t-shirt, blue shorts"),
 "Pari":   ("परी", V + "pari.wav", "यह छोटा दीया मेरे पापा की मदद करेगा। इसमें मेरा बहुत सारा प्यार है!",
            "Pari, a 9-year-old Indian girl with two ponytails tied with pink ribbons, pink frock with white polka dots"),
 "Chintu": ("चिंटू", V + "golu.wav", "यह छोटा दीया मेरे पापा की मदद करेगा। इसमें मेरा बहुत सारा प्यार है!",
            "Chintu, a chubby 7-year-old Indian boy with round black glasses, red and white striped t-shirt, brown shorts"),
 "Gauri":  ("गौरी", "projects/ganesh-dadi/voices/meena.wav", "यह छोटा दीया मेरे पापा की मदद करेगा। इसमें मेरा बहुत सारा प्यार है!",
            "Gauri, a thin 10-year-old poor Indian village girl with long untidy black hair, faded torn green ghagra and blouse, silver anklets, barefoot"),
 "Amma":   ("गौरी की माँ", V + "parvati.wav", "गणेश, मेरे प्यारे बेटे। जो भी काम करो, मन में प्रेम रखकर करना। यही सबसे बड़ी पूजा है।",
            "Gauri's mother, a thin sick Indian village woman about 35, faded blue cotton saree, lying weakly on a rope cot"),
}
STYLE = "detailed colorful Indian cartoon storybook illustration, 2D digital painting, expressive emotional faces, rich village details, clean lines, high quality"
NIGHT = "night scene, bright full moon, deep blue moonlight, warm lantern glow"
# (scene, image prompt, [(speaker, text), ...], motion prompt or None)
S = [
 # 1 cold open (hook)
 (1, "{Pari} and {Monu} sitting up in fear on a rope cot under a white mosquito net on a village rooftop at midnight, staring towards a dark mango orchard, " + NIGHT,
  [("Dadi", "आधी रात थी। पूरा गाँव गहरी नींद में सो रहा था।"), ("Pari", "मोनू भैया! सुनो… यह छन-छन की आवाज़ कहाँ से आ रही है?")],
  "the two children slowly turn their heads in fear, the mosquito net sways in the night breeze, moonlight flickers, smooth gentle motion"),
 (1, "a dark mango orchard at midnight with tall trees, mist on the ground and a faint glowing silhouette of a small girl between the trees, mysterious, " + NIGHT,
  [("Monu", "बाग़ में… बाग़ में कोई है! किसी की पायल बज रही है!")], "mist drifts slowly between the mango trees, leaves sway, the faint figure moves slightly, eerie gentle motion"),
 # 2 arrival (day)
 (2, "a colourful village bus stop on a dusty road in summer, {Monu}, {Pari} and {Chintu} jumping happily off an old bus with small bags, green fields and mango trees behind",
  [("Dadi", "यह कहानी शुरू होती है गर्मियों की छुट्टियों से। मोनू, परी और छोटा चिंटू, दादी के गाँव रामपुर आए थे।")], None),
 (2, "{Dadi} standing at the door of a big old village house with a tiled roof, arms open wide, smiling warmly, sunny summer afternoon",
  [("Dadi", "आ गए मेरे बच्चे! चलो, हाथ-मुँह धो लो। आज मैंने तुम्हारे लिए आम पन्ना बनाया है।"), ("Chintu", "दादी, मुझे दो गिलास चाहिए!")], None),
 (2, "{Chintu} drinking a big glass of green mango drink in a village courtyard, eyes closed with joy, a clay pot and brass glasses nearby, sunny",
  [("Dadi", "दिन भर बच्चों ने खूब मस्ती की। कभी कंचे खेले, कभी नहर में पैर डालकर बैठे।")], None),
 (2, "{Monu} and {Pari} running happily through a big green mango orchard full of ripe yellow mangoes, sunny afternoon, birds flying",
  [("Pari", "भैया, देखो! इतने सारे आम! यह बाग़ किसका है?"), ("Monu", "दादी कहती हैं, यह हमारे परदादा जी का बाग़ है।")], None),
 (2, "a strict old Indian village watchman with a white mustache, white turban and a long bamboo stick, standing under a mango tree, warning with a raised finger, sunny",
  [("Dadi", "बाग़ के चौकीदार, रामू काका, ने बच्चों को रोका।"), ("Dadi", "बच्चों, शाम के बाद इस बाग़ में मत आना। लोग कहते हैं, यहाँ रात को कोई घूमता है।")], None),
 (2, "{Chintu} hiding behind {Pari} in fear in a mango orchard, both looking scared, golden evening light",
  [("Chintu", "द… दीदी, कौन घूमता है? भूत?"), ("Pari", "डरपोक! भूत-वूत कुछ नहीं होते।")], None),
 # 3 night on the roof
 (3, "a village rooftop at night with three rope cots under white mosquito nets, a clay water pot, a glowing lantern, {Dadi} sitting on one cot telling a story, " + NIGHT,
  [("Dadi", "रात को सब छत पर सोए। ठंडी हवा चल रही थी, और आसमान तारों से भरा था।")],
  "the mosquito nets sway gently in the night breeze, the lantern flame flickers, stars twinkle, calm smooth motion"),
 (3, "{Dadi} smiling and telling a story to children at night on a village rooftop, lantern light on her face, " + NIGHT,
  [("Dadi", "सो जाओ बच्चों। कल सुबह जल्दी उठकर खेत चलेंगे।"), ("Monu", "ठीक है दादी। शुभ रात्रि!")], None),
 (3, "a full moon behind a tall mango tree at midnight, a lonely village road, a dog lifting its head, " + NIGHT, [("Dadi", "पर आधी रात को…")], None),
 (3, "{Pari} waking up suddenly under a mosquito net at midnight, eyes wide open with fear, holding her blanket, " + NIGHT,
  [("Pari", "छन… छन… छन… फिर वही आवाज़! मोनू भैया, उठो!")], "the girl's eyes open wide in fear, she slowly sits up and holds her blanket tight, the mosquito net moves gently"),
 (3, "{Monu} rubbing his sleepy eyes on a cot under a mosquito net at night, looking confused, " + NIGHT,
  [("Monu", "क्या हुआ परी? सोने दो ना…"), ("Pari", "बाग़ की तरफ़ देखो! वहाँ कुछ चमक रहा है!")], None),
 (3, "view from a village rooftop at night towards a mango orchard, a small moving light like a tiny lamp between the trees, mysterious mist, " + NIGHT,
  [("Monu", "सच में! कोई दीया लेकर घूम रहा है। और यह पायल की आवाज़…"), ("Chintu", "मुझे डर लग रहा है! मैं दादी के पास सोऊँगा!")], None),
 (3, "{Chintu} pulling the blanket over his head on a cot at night, only his round glasses peeping out, funny scared expression, " + NIGHT,
  [("Dadi", "चिंटू ने चादर सिर तक ओढ़ ली। पर मोनू और परी की आँखों से नींद उड़ चुकी थी।")], None),
 # 4 next morning: clues
 (4, "{Monu} and {Pari} walking into a mango orchard in the early morning sunlight, looking around curiously, fallen leaves on the ground",
  [("Dadi", "अगली सुबह, दोनों चुपके से बाग़ में पहुँचे।"), ("Monu", "परी, रात को यहीं से आवाज़ आई थी।")], None),
 (4, "close-up of small bare footprints in the soft mud under a mango tree, a few fallen mangoes and a tiny silver anklet bell lying on the ground, morning light",
  [("Pari", "भैया, यहाँ देखो! छोटे-छोटे पैरों के निशान!"), ("Monu", "और यह… पायल का एक घुँघरू!")], None),
 (4, "{Pari} holding a tiny silver anklet bell in her palm and looking at it thoughtfully, mango orchard in morning sunlight",
  [("Pari", "भूत के पैर तो उल्टे होते हैं ना? ये तो सीधे हैं। मतलब यह कोई बच्चा है!"), ("Monu", "आज रात हम पता लगाकर रहेंगे।")], None),
 # 5 second night: the chase
 (5, "{Monu} and {Pari} tiptoeing down the stairs of a village house at midnight holding a small torch, finger on lips, " + NIGHT,
  [("Dadi", "उस रात, जब सब सो गए, मोनू और परी टॉर्च लेकर चुपचाप नीचे उतरे।")], None),
 (5, "{Monu} and {Pari} hiding behind a thick mango tree trunk at night, peeping out with a torch, scared but brave, mist, " + NIGHT,
  [("Dadi", "बाग़ में घना अँधेरा था। हवा से पत्ते सरसरा रहे थे।"), ("Pari", "श्श्श… वो देखो!")],
  "the children peep slowly from behind the tree, leaves rustle in the wind, mist drifts, the torch light trembles"),
 (5, "a thin girl seen from behind in the moonlit mango orchard, long untidy black hair, faded torn green ghagra, silver anklets, picking up fallen mangoes into a cloth bag, holding a small clay lamp, " + NIGHT,
  [("Dadi", "पेड़ों के बीच एक दुबली-पतली लड़की, एक हाथ में दीया लिए, नीचे गिरे आम चुन रही थी।")],
  "the girl slowly bends and picks up a mango, her long hair moves in the wind, the clay lamp flame flickers, silver anklets shine"),
 (5, "{Monu} shining a torch and stepping out from behind a tree at night, calling out bravely, " + NIGHT,
  [("Monu", "रुको! कौन हो तुम?")], None),
 (5, "{Gauri} turning around in shock in a moonlit mango orchard, mangoes falling from her cloth bag, holding a small clay lamp, scared eyes, " + NIGHT,
  [("Gauri", "म… माफ़ कर दो! मैंने चोरी नहीं की! मैं तो बस नीचे गिरे आम उठा रही थी!")],
  "the girl turns around in shock, mangoes fall from her bag, her eyes fill with fear, the lamp flame shakes"),
 # 6 the truth
 (6, "{Pari} kneeling kindly next to {Gauri} who is crying in a moonlit mango orchard, Pari holding Gauri's hand, " + NIGHT,
  [("Pari", "डरो मत। हम तुम्हें कुछ नहीं कहेंगे। तुम्हारा नाम क्या है?"), ("Gauri", "गौरी। मैं बगल वाले गाँव से आती हूँ।")], None),
 (6, "{Gauri} crying and talking with tears in her eyes in the moonlit orchard, holding a cloth bag of mangoes to her chest, " + NIGHT,
  [("Gauri", "मेरी माँ बहुत बीमार है। घर में खाने को कुछ नहीं है। दिन में आने से शर्म आती है, इसलिए रात को आती हूँ।")],
  "a tear rolls down the girl's cheek, she hugs the cloth bag, her hair moves softly in the night breeze"),
 (6, "{Monu} and {Pari} looking at each other with sad, emotional faces in a moonlit orchard, " + NIGHT,
  [("Dadi", "मोनू और परी की आँखें भर आईं। जिसे वे भूत समझ रहे थे, वह तो एक बहादुर, मेहनती बच्ची थी।")], None),
 (6, "{Monu} taking off his own torch and handing it to {Gauri} in a moonlit mango orchard, kind smile, " + NIGHT,
  [("Monu", "गौरी, कल सुबह हमारे घर आना। हमारी दादी बहुत अच्छी हैं।")], None),
 # 7 morning with Dadi
 (7, "{Dadi} listening seriously while {Pari} tells her something in a sunny village courtyard in the morning",
  [("Dadi", "सुबह बच्चों ने दादी को सब बता दिया।"), ("Pari", "दादी, गौरी की माँ बीमार है। हम उनकी मदद करें ना?")], None),
 (7, "{Dadi} smiling proudly and patting {Monu} on the head in a sunny village courtyard",
  [("Dadi", "शाबाश मेरे बच्चों! तुमने डर के आगे सच ढूँढा, और सच के आगे दया दिखाई।")], None),
 (7, "{Dadi}, {Monu} and {Pari} walking on a village path carrying a basket of fruits, vegetables and a bag of rice, sunny morning",
  [("Dadi", "दादी बच्चों के साथ गौरी के घर गईं। साथ में अनाज, फल और दवाई ले गईं।")], None),
 (7, "{Amma} lying on a rope cot inside a poor mud hut, {Dadi} sitting beside her giving medicine in a small spoon, soft morning light from a small window",
  [("Amma", "आप लोग देवता बनकर आए हैं, अम्मा जी।"), ("Dadi", "नहीं बहन, हम सब एक-दूसरे का सहारा हैं। अब आप जल्दी ठीक हो जाइए।")], None),
 (7, "{Gauri} smiling with happy tears, hugging {Pari} outside a small mud hut, sunny morning",
  [("Gauri", "धन्यवाद नहीं बोलूँगी… आज से तुम मेरी पक्की सहेली हो!")], "the two girls hug happily, the sunlight shines, their hair moves gently, joyful smooth motion"),
 # 8 ending
 (8, "{Monu}, {Pari} and {Chintu} with {Gauri} sitting on a branch and under a mango tree eating mangoes together, laughing, golden evening",
  [("Dadi", "उस दिन के बाद, गौरी रोज़ दिन में बाग़ आने लगी। अब आम सबके साथ बँटते थे।"), ("Chintu", "और अब रात को कोई पायल नहीं बजेगी! मैं आराम से सोऊँगा!")], None),
 (8, "{Dadi} smiling at night on the rooftop with a lantern, looking at the camera warmly, stars behind, " + NIGHT,
  [("Dadi", "बच्चों, याद रखना, हर डर के पीछे कोई सच छिपा होता है। और हर ज़रूरतमंद के पीछे एक कहानी।"), ("Dadi", "अगली रात, एक और रहस्य… पुराने कुएँ से किसकी आवाज़ आई? मिलते हैं अगली कहानी में!")], None),
]
chars = [{"name": k, "hindi_name": v[0], "voice": "f5", "ref": v[1], "ref_text": v[2], "look": v[3]} for k, v in CH.items()]
json.dump({"style": "FLUX storybook pictures + Ken Burns + motion clips", "narrator_voice": "Dadi", "characters": chars}, open("3-characters.json", "w"), ensure_ascii=False, indent=1)
shots, prompts, motion = [], [], []
for i, (sc, img, lines, mot) in enumerate(S):
    sid, pid = f"s{i + 1:02d}", f"p{i + 1:02d}"
    shots.append({"id": sid, "scene": sc, "location": "village", "set": "village", "image": pid, "clip": ("m" + pid[1:]) if mot else None,
                  "lines": [{"speaker": s, "text": t} for s, t in lines]})
    prompts.append({"id": pid, "prompt": img, "seed": 100 + i})
    if mot: motion.append({"id": "m" + pid[1:], "image": f"images/{pid}.png", "prompt": mot + ", 2D storybook illustration style, smooth cinematic motion", "w": 768, "h": 448, "frames": 49, "steps": 22})
json.dump({"shots": shots}, open("4-storyboard.json", "w"), ensure_ascii=False, indent=1)
json.dump({"model": "flux", "style": STYLE, "characters": {k: v[3] for k, v in CH.items()}, "images": prompts}, open("prompts.json", "w"), ensure_ascii=False, indent=1)
json.dump({"clips": motion}, open("motion.json", "w"), ensure_ascii=False, indent=1)
json.dump({"series": "दादी के गाँव की रहस्यमयी रातें", "episode": 1, "title": "आधी रात को आम के बाग़ में पायल किसकी? 😱",
           "moral": "हर डर के पीछे कोई सच छिपा होता है, और हर ज़रूरतमंद के पीछे एक कहानी।", "audience": "family, not made for kids"}, open("2-script.json", "w"), ensure_ascii=False, indent=1)
n = sum(len(s["lines"]) for s in shots); w = sum(len(l["text"].split()) for s in shots for l in s["lines"])
print(f"{len(shots)} shots, {n} lines, {w} words (~{w / 2.1 / 60:.1f} min), {len(motion)} motion clips")
