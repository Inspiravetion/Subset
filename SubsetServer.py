import SimpleHTTPServer
import SocketServer
import tornado.ioloop
import tornado.web
import json
from tornado.platform import kqueue
from tornado import httpserver
from tornado import websocket

class SubsetWebsocketServer():
	def __init__(self):
		global sockets
		sockets = []
		self.server = tornado.web.Application([
			(r'/socket', WebsocketHandler),
			(r'/(.*)', tornado.web.StaticFileHandler, { 'path' : './'})
		])
		self.running = False;

	def start(self, port):
		self.server.listen(port)
		tornado.ioloop.IOLoop.instance().start()
		self.running = True

	def broadcast(self, message, subset):
		for socket in sockets:
			print 'broadcasting...'
			socket.emit(json.dumps(subset));

class WebsocketHandler(websocket.WebSocketHandler):
	def open(self):
		global sockets
		sockets.append(self)
		self.on_open()

	def on_message(self, message):
		self.emit(json.loads(message)['message'])

	def on_open(self):
		self.emit('heres a lil sumthn sumthn')

	def emit(self, msg):
		self.write_message(json.dumps({
			'type' : 'trial', 
			'message' : msg
		}))

SubsetWebsocketServer().start(8001)
