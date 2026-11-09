#!/bin/sh
set -eu

target_dir='/opt/mksia/core/nginx/conf.d/snippets'
target_file="$target_dir/mk-autoparts-cloudflare-ips.conf"
temp_file="$(mktemp)"

cleanup() {
  rm -f "$temp_file"
}
trap cleanup EXIT INT TERM

{
  printf '# Gerado a partir das listas oficiais da Cloudflare.\n'
  curl --fail --silent --show-error https://www.cloudflare.com/ips-v4 | while IFS= read -r cidr || [ -n "$cidr" ]; do
    [ -n "$cidr" ] && printf 'allow %s;\n' "$cidr"
  done
  curl --fail --silent --show-error https://www.cloudflare.com/ips-v6 | while IFS= read -r cidr || [ -n "$cidr" ]; do
    [ -n "$cidr" ] && printf 'allow %s;\n' "$cidr"
  done
  printf 'deny all;\n'
} > "$temp_file"

allow_count="$(grep -c '^allow ' "$temp_file")"
if [ "$allow_count" -lt 20 ]; then
  printf 'Lista de IPs da Cloudflare incompleta: %s entradas.\n' "$allow_count" >&2
  exit 1
fi

install -d -m 0755 "$target_dir"
install -m 0644 "$temp_file" "$target_file"
