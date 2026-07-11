import json
from graphify.detect import detect
from pathlib import Path

result = detect(Path("."))
Path("graphify-out/.graphify_detect.json").write_text(
    json.dumps(result, ensure_ascii=False), encoding="utf-8"
)
tf = result["total_files"]
tw = result["total_words"]
print("total_files=" + str(tf))
print("total_words=" + str(tw))
for cat in ["code","document","paper","image","video"]:
    files = result.get("files",{}).get(cat,[])
    if files:
        print(cat + "=" + str(len(files)))
skipped = result.get("skipped_sensitive",[])
if skipped:
    print("skipped_sensitive=" + str(len(skipped)))
