import http.server
import socketserver
import os

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

    def do_GET(self):
        # Serve index.html for the root path
        if self.path == '/':
            self.path = '/template.html'
        return super().do_GET()

PORT = 8001

def run():
    handler_class = http.server.SimpleHTTPRequestHandler
    server_class = socketserver.TCPServer
    server_address = ('', PORT)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server at http://localhost:{PORT}")
    httpd.serve_forever()

if __name__ == '__main__':
    run() 