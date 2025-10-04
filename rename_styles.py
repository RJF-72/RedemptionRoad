import pathlib
import re
from collections import defaultdict

STYLE_DIR = pathlib.Path(r"c:\Users\flana\Downloads\SOTA SYNTH\Consolidated\Instruments\Style")


def normalize_name(stem: str) -> str:
    tokens = re.findall(r"[A-Za-z0-9]+", stem)
    if not tokens:
        return "Track"
    return "".join(token.capitalize() for token in tokens)


def main() -> None:
    mp3_files = sorted(STYLE_DIR.glob("*.mp3"), key=lambda p: p.name.lower())
    used = defaultdict(int)
    changes = []

    for path in mp3_files:
        base_name = normalize_name(path.stem)
        candidate = f"{base_name}.mp3"

        # Resolve conflicts by appending sequential numbers
        while STYLE_DIR.joinpath(candidate).exists() and candidate.lower() != path.name.lower():
            used[base_name] += 1
            candidate = f"{base_name}{used[base_name]:02d}.mp3"

        target = STYLE_DIR.joinpath(candidate)
        if candidate != path.name:
            path.rename(target)
            changes.append((path.name, candidate))

    print(f"Renamed {len(changes)} files.")
    for old, new in changes:
        print(f"{old} -> {new}")


if __name__ == "__main__":
    main()