import re, sys

with open("coverage/lcov.info") as f:
    content = f.read()

sections = content.split("SF:")
for section in sections[1:]:
    lines = section.strip().split("\n")
    filepath = lines[0]
    
    skip = ['src/app/', '__tests__', '.test.', 'node_modules']
    if any(s in filepath for s in skip):
        continue
    
    uncovered = []
    for line in lines:
        if line.startswith("FNDA:"):
            parts = line[5:].split(",", 1)
            if parts[0] == "0":
                uncovered.append(parts[1] if len(parts) > 1 else "?")
    
    br_total = next((int(l[4:]) for l in lines if l.startswith("BRF:")), 0)
    br_hit = next((int(l[4:]) for l in lines if l.startswith("BRH:")), 0)
    br_miss = br_total - br_hit
    
    if uncovered or br_miss > 0:
        rel = filepath.split("/src/")[-1] if "/src/" in filepath else filepath
        print(f"\n{rel} (B miss:{br_miss})")
        for fn in uncovered:
            print(f"  UNCOV FN: {fn}")
