import argparse
import os
import requests

# Simple local script to call your deployed API for batch authenticity comparisons.
# Usage (Windows cmd):
#   python tools\batch_compare.py --base https://redemptionrd.shop --profile melodic \
#          --ref "C:\\Users\\flana\\Downloads\\SOTA SYNTH\\Guitar" \
#          --cand "C:\\Users\\flana\\Downloads\\SOTA SYNTH\\Piano" \
#          --mode filename --out authenticity_results.csv
# Modes: filename (match same basename), index (sort by name and pair), cross (every vs every)

def list_audio(folder):
    exts = {'.wav','.mp3','.flac','.ogg','.m4a','.aac','.wma'}
    files = []
    for root, _, fs in os.walk(folder):
        for fn in fs:
            if os.path.splitext(fn)[1].lower() in exts:
                files.append(os.path.join(root, fn))
    return files

def basename_no_ext(p):
    return os.path.splitext(os.path.basename(p))[0].lower()

def pairs_filename(refs, cands):
    m = {basename_no_ext(p): p for p in refs}
    out = []
    for q in cands:
        b = basename_no_ext(q)
        if b in m:
            out.append((m[b], q, b))
    return out

def pairs_index(refs, cands):
    ra = sorted(refs)
    ca = sorted(cands)
    L = min(len(ra), len(ca))
    return [(ra[i], ca[i], f"{os.path.basename(ra[i])} ⇄ {os.path.basename(ca[i])}") for i in range(L)]

def pairs_cross(refs, cands):
    out = []
    for r in sorted(refs):
        for c in sorted(cands):
            out.append((r, c, f"{os.path.basename(r)} ⇄ {os.path.basename(c)}"))
    return out

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='https://redemptionrd.shop')
    ap.add_argument('--ref', required=True)
    ap.add_argument('--cand', required=True)
    ap.add_argument('--mode', choices=['filename','index','cross'], default='filename')
    ap.add_argument('--profile', choices=['melodic','general'], default='melodic')
    ap.add_argument('--out', default='authenticity_results.csv')
    args = ap.parse_args()

    refs = list_audio(args.ref)
    cands = list_audio(args.cand)
    if not refs or not cands:
        raise SystemExit('No audio found in one of the folders.')

    if args.mode == 'filename':
        pairs = pairs_filename(refs, cands)
    elif args.mode == 'index':
        pairs = pairs_index(refs, cands)
    else:
        pairs = pairs_cross(refs, cands)

    session = requests.Session()
    url = args.base.rstrip('/') + '/api/audio/authenticity'

    import csv
    with open(args.out, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['name','authenticity_percent','dtw_based','centroid_corr','chroma_cosine','dtw_raw','profile'])
        for rp, cp, name in pairs:
            with open(rp, 'rb') as rf, open(cp, 'rb') as cf:
                files = {
                    'reference': (os.path.basename(rp), rf, 'application/octet-stream'),
                    'candidate': (os.path.basename(cp), cf, 'application/octet-stream')
                }
                data = {'profile': args.profile}
                r = session.post(url, files=files, data=data, timeout=120)
                j = r.json()
                if r.status_code != 200:
                    print('Error for', name, j)
                    continue
                w.writerow([
                    name,
                    j.get('authenticity_percent',''),
                    j.get('similarity',{}).get('dtw_based',''),
                    j.get('similarity',{}).get('centroid_corr',''),
                    j.get('similarity',{}).get('chroma_cosine',''),
                    j.get('dtw_raw',''),
                    j.get('profile','')
                ])
                print('OK', name, j.get('authenticity_percent'))
