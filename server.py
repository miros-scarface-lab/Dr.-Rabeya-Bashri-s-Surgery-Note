import http.server
import socketserver
import json
import os
import re

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def deep_merge(target, source):
    """Recursively merge source dict into target dict."""
    output = dict(target)
    for key, value in source.items():
        if key in output and isinstance(output[key], dict) and isinstance(value, dict):
            output[key] = deep_merge(output[key], value)
        else:
            output[key] = value
    return output

def update_site_content_js(content):
    """Update DEFAULT_SITE_CONTENT in assets/js/site-content.js permanently."""
    js_path = os.path.join(DIRECTORY, 'assets', 'js', 'site-content.js')
    if not os.path.exists(js_path):
        return
    try:
        with open(js_path, 'r', encoding='utf-8') as f:
            code = f.read()

        json_str = json.dumps(content, indent=2, ensure_ascii=False)
        pattern = r'(const DEFAULT_SITE_CONTENT\s*=\s*)\{[\s\S]*?\n\};'
        new_code = re.sub(pattern, lambda m: m.group(1) + json_str + ';', code, count=1)

        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(new_code)
    except Exception as e:
        print(f"[Server] Error updating site-content.js: {e}")

def update_index_html(content):
    """Synchronize index.html directly on disk so raw HTML contains the latest content with zero loading glitch."""
    index_path = os.path.join(DIRECTORY, 'index.html')
    if not os.path.exists(index_path):
        return
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            html = f.read()

        # Update SEO tags if present
        if isinstance(content.get('seo'), dict):
            seo = content['seo']
            if 'meta_title' in seo and seo['meta_title']:
                title_val = seo['meta_title']
                html = re.sub(r'<title>.*?</title>', f'<title>{title_val}</title>', html, count=1)
                html = re.sub(r'(<meta property="og:title" content=").*?(">)', f'\\g<1>{title_val}\\g<2>', html, count=1)
                html = re.sub(r'(<meta name="twitter:title" content=").*?(">)', f'\\g<1>{title_val}\\g<2>', html, count=1)

            if 'meta_description' in seo and seo['meta_description']:
                desc_val = seo['meta_description']
                html = re.sub(r'(<meta name="description"\s+content=").*?(">)', f'\\g<1>{desc_val}\\g<2>', html, count=1)
                html = re.sub(r'(<meta property="og:description"\s+content=").*?(">)', f'\\g<1>{desc_val}\\g<2>', html, count=1)
                html = re.sub(r'(<meta name="twitter:description"\s+content=").*?(">)', f'\\g<1>{desc_val}\\g<2>', html, count=1)

            if 'meta_keywords' in seo and seo['meta_keywords']:
                kw_val = seo['meta_keywords']
                html = re.sub(r'(<meta name="keywords"\s+content=").*?(">)', f'\\g<1>{kw_val}\\g<2>', html, count=1)

            if 'google_verification' in seo and seo['google_verification']:
                gv_val = seo['google_verification']
                html = re.sub(r'(<meta name="google-site-verification"\s+content=").*?(">)', f'\\g<1>{gv_val}\\g<2>', html, count=1)

        # Flatten nested fields
        flat = {}
        def flatten(d, prefix=''):
            for k, v in d.items():
                curr = f"{prefix}.{k}" if prefix else k
                if isinstance(v, dict):
                    flatten(v, curr)
                elif isinstance(v, (str, int, float)):
                    flat[curr] = str(v)

        flatten(content)

        # Replace text inside tags with data-cms="key"
        for key, val in flat.items():
            escaped_key = re.escape(key)
            pattern = r'(data-cms="' + escaped_key + r'"[^>]*>)([^<]*?)(</(?:span|p|h1|h2|h3|h4|h5|div|a|strong|li)>)'
            html = re.sub(pattern, lambda m, v=val: m.group(1) + v + m.group(3), html)

        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print("[Server] Successfully synchronized index.html on disk with updated CMS content.")
    except Exception as e:
        print(f"[Server] Error updating index.html: {e}")

class PermanentCMSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Disable aggressive browser caching for JSON and HTML files during development
        if self.path.endswith('.json') or self.path.endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/get-content':
            json_path = os.path.join(DIRECTORY, 'site_content.json')
            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(data.encode('utf-8'))
                return
            else:
                self.send_response(404)
                self.end_headers()
                return
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/save-content':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length).decode('utf-8')
                content = json.loads(body)

                # 1. Merge with existing site_content.json
                json_path = os.path.join(DIRECTORY, 'site_content.json')
                existing = {}
                if os.path.exists(json_path):
                    try:
                        with open(json_path, 'r', encoding='utf-8') as f:
                            existing = json.load(f)
                    except Exception:
                        existing = {}

                merged = deep_merge(existing, content)
                # If chambersList was explicitly provided, ensure it overwrites cleanly
                if 'chambersList' in content:
                    merged['chambersList'] = content['chambersList']

                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(merged, f, indent=2, ensure_ascii=False)

                # 2. Update DEFAULT_SITE_CONTENT in assets/js/site-content.js permanently
                update_site_content_js(merged)

                # 3. Synchronize index.html directly on disk to prevent any loading glitch
                update_index_html(merged)

                # Response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response_data = {
                    'success': True,
                    'savedToDisk': True,
                    'message': 'Changes permanently written to site_content.json, site-content.js, and index.html'
                }
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                print("[Server] Successfully saved CMS updates permanently to disk and index.html.")
            except Exception as e:
                print(f"[Server] Error saving CMS content: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    # Initial synchronization of index.html with site_content.json on startup
    json_path = os.path.join(DIRECTORY, 'site_content.json')
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                init_data = json.load(f)
            update_index_html(init_data)
        except Exception as e:
            print(f"[Server] Initial sync error: {e}")

    # Allow port reuse immediately upon restart
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), PermanentCMSHandler) as httpd:
        print(f"[Server] Running on http://localhost:{PORT} with permanent CMS disk persistence...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
