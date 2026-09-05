"""Materialize the reviewed upstream and overlay without touching other applications."""
import json
import pathlib
import shutil
import subprocess
import sys

root = pathlib.Path(__file__).resolve().parent
lock = json.loads((root / 'upstream.lock.json').read_text())
destination = pathlib.Path(sys.argv[1]).resolve()
if destination.exists():
    raise SystemExit('Destination must not exist; refusing to overwrite a checkout.')
subprocess.run(['git', 'clone', '--no-checkout', lock['repository'], str(destination)], check=True)
subprocess.run(['git', 'checkout', '--detach', lock['commit']], cwd=destination, check=True)
actual = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=destination, text=True).strip()
if actual != lock['commit']:
    raise SystemExit('Upstream revision mismatch')
shutil.copytree(root / 'overlay', destination, dirs_exist_ok=True)
print(f'Prepared pinned VPNMarket at {destination}')
