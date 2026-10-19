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

                # Response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response_data = {
                    'success': True,
                    'savedToDisk': True,
                    'message': 'Changes permanently written to site_content.json and site-content.js'
                }
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                print("[Server] Successfully saved CMS updates permanently to disk.")
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
    # Allow port reuse immediately upon restart
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), PermanentCMSHandler) as httpd:
        print(f"[Server] Running on http://localhost:{PORT} with permanent CMS disk persistence...")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
