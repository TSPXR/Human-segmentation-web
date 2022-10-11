import ssl
import os
import argparse
import asyncio
import websockets
import cv2
import numpy as np
import base64
import cv2

class TCPServer():
    def __init__(self, hostname, port, cert_dir, key_dir, password):
        super().__init__()
        self.hostname = hostname
        self.port = port
        self.cert_dir = cert_dir
        self.key_dir = key_dir
        self.password = password
    
    def rcv_data(self, data: str):
        # Base64 이미지를 받은 뒤 np.ndarray로 decode
        base64_data = data[0]
        imgdata = base64.b64decode(base64_data)
        frame = np.frombuffer(imgdata, np.uint8)
        frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)

        cv2.imshow('window', frame)
        cv2.waitKey(1)

        
    async def loop_logic(self, websocket: websockets, path):        
        while True:    
            # Wait data from client
            data = await asyncio.gather(websocket.recv())
            # Encode and calculate detection
            self.rcv_data(data=data)
            # Remove end of string ','


    def run_server(self):
        if USE_LOCAL:
            self.ssl_context = None
        else:
            self.ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            self.ssl_context.load_cert_chain(certfile=self.cert_dir, keyfile=self.key_dir, password=self.password)
        self.start_server = websockets.serve(self.loop_logic,
                                            port=self.port, ssl=self.ssl_context,
                                            max_size=402144,
                                            max_queue=8,
                                            read_limit=2**20,
                                            write_limit=2**8)
        asyncio.get_event_loop().run_until_complete(self.start_server)
        asyncio.get_event_loop().run_forever()
        
if __name__ == "__main__":
    USE_LOCAL = True
    
    parser = argparse.ArgumentParser(description="Face Detection Server")
    parser.add_argument('--ssl_path', '-sp',
                                                type=str,
                                                help='SSL File Path [default : ../]',
                                                default='../ssl/')
    parser.add_argument('--port', '-p',
                                                type=int,
                                                help='SSL Port [default : 7777]',
                                                default=7777)
    parser.add_argument('--password', '-pw',
                                                type=str,
                                                help='SSL Password [default : None]',
                                                default='tsp190910')
    parser.add_argument('--use_local', '-ul',
                                                type=bool,
                                                help='Launch Server Local Setting (127.0.0.1) [default : False]',
                                                default=False)
    
    args = parser.parse_args()
    
    cert = os.path.join(args.ssl_path, 'park-tdl.tspxr.ml-crt.pem')
    key = os.path.join(args.ssl_path, 'park-tdl.tspxr.ml-key.pem')

    USE_LOCAL = args.use_local

    if USE_LOCAL:
        hostname = '127.0.0.1'
    else:
        hostname = '0.0.0.0'

    server = TCPServer(
        hostname = hostname,
        port = args.port,
        cert_dir = cert,
        key_dir = key,
        password = args.password
    )
    server.run_server()