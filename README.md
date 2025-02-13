# NJROTC Autograde

### Concept

Create an application that allows for quick and easy autograding of cadet uniforms for using in JROTC.

### Install and building

Tech stack:
- Minification: [csso-cli](https://github.com/css/csso-cli), [uglify-js](https://github.com/mishoo/UglifyJS), & [minify-html](https://github.com/wilsonzlin/minify-html).
- HTML "Framework": [Nova](https://github.com/iiPythonx/nova)
- Hosting: [Cloudflare Pages](https://cloudflare.com/pages)

Supported environment:
- [Python 3.11 or above](https://python.org)
- A valid Javascript package manager, [npm](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager), [bun](https://bun.sh), etc.
- A (good) Python venv system, [uv](https://github.com/astral-sh/uv), [python3 -m venv](https://docs.python.org/3/library/venv.html), etc.

The general setup and build procedure looks like this:

```sh
uv venv
uv pip install git@github.com:iiPythonx/nova-framework minify-html
bun i -g csso-cli uglify-js
nova build
```

### Deployment

To deploy the site to a Cloudflare pages based workflow, run `wrangler pages deploy`; a `wrangler.toml` file is provided for you in regards to project name.

If you want to manually host it, create a (production) build with `nova build`, and then host the results of `dist/`.

### Licensing

This project is released strictly as no-warranty. Support will be provided for the Grenada NJROTC Bravo Seals and nobody else.

The code is licensed under the [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html), the full license is in `COPYING`.
