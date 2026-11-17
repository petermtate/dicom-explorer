#!/usr/bin/env bash
set -euo pipefail

npm ci

# pstack v0.9.138
revision=2044f1810afc98c3aa80100587dd990c83cf6ea8
checkout="$HOME/.local/share/pstack-claude/$revision"
skills_dir="$HOME/.agents/skills"

if [[ ! -f "$checkout/plugins/pstack/skills/poteto-mode/SKILL.md" ]]; then
  mkdir -p "$(dirname "$checkout")"
  staging="$(mktemp -d "$(dirname "$checkout")/install.XXXXXX")"
  trap 'rm -rf "$staging"' EXIT
  git init --quiet "$staging"
  git -C "$staging" fetch --quiet --depth=1 https://github.com/michael-denyer/pstack-claude.git "$revision"
  git -C "$staging" checkout --quiet --detach FETCH_HEAD
  mv -T "$staging" "$checkout"
fi

mkdir -p "$skills_dir"
for skill in "$checkout"/plugins/pstack/skills/*/; do
  [[ -f "${skill}SKILL.md" ]] || continue
  target="$skills_dir/$(basename "$skill")"
  if [[ ! -e "$target" && ! -L "$target" ]]; then
    ln -sT "${skill%/}" "$target"
  fi
done
