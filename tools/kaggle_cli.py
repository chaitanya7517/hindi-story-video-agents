"""Run the official Kaggle CLI through this cloud machine's network proxy.
The proxy adds the saved Kaggle token to requests for www.kaggle.com, so the CLI is pointed there
(instead of api.kaggle.com) and given a placeholder token. Never put a real token in code.
Usage: python tools/kaggle_cli.py <kaggle cli args...>   e.g. kernels list --mine"""
import os, sys
os.environ.setdefault("KAGGLE_API_TOKEN", "KGAT_proxy_injected_placeholder_000000")
import kagglesdk.kaggle_env as ke
ke._env_to_endpoint[ke.KaggleEnv.PROD] = "https://www.kaggle.com/api"
from kaggle.cli import main
sys.argv = ["kaggle"] + sys.argv[1:]
main()
