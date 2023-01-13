var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cpu = require('./cpu.js');
var os = require('os');
var diskspace = require('diskspace');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', (client) => {
	console.log('Client connected..');
	client.on('join', function (data) {
		console.log(data);
	});

	// setInterval เป็นฟังก์ชันที่จะทำให้มีการทำงานทุกๆ 1000 milisecond หรือ 1 วินาที
	setInterval(() => {
		var currentDate = new Date();
		io.sockets.emit('clock', { currentDate: currentDate });
	}, 1000);

	var startMeasure = cpu.cpuAverage();
	setTimeout(() => {
		var endMeasure = cpu.cpuAverage();
		var idleDifference = endMeasure.idle - startMeasure.idle;
		var totalDifference = endMeasure.total - startMeasure.total;
		var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
		io.sockets.emit('cpu', { percentageCPU: percentageCPU });
	}, 100);

	var freemem = os.freemem();
	var totalmem = os.totalmem();
	console.log(freemem, totalmem);
	var percentageMem = 100 - ~~(100 * freemem / totalmem);
	io.sockets.emit('memory', { percentageMem: percentageMem });

	diskspace.check('/', (err, result) => {
		var usedDisk = result.used;
		var totalDisk = result.total;
		var percentageDisk = 100 - ~~(100 * usedDisk / totalDisk);
		io.sockets.emit('disk', { percentageDisk: percentageDisk });
	});
});

http.listen(3000, () => {
	console.log('Listening on port 3000..');
});

//*--------------------------------------------------------------------*//

var app = require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

io.on('connection', (client) => {
	console.log('Client connected..');

	// Listen message from client
	client.on('chat message', (msg) => {
		console.log('Server Message: ' + msg);

		// Reply message to client
		io.emit('chat message', msg);
	});
});

http.listen(3000, function () {
	console.log('Listening on port 3000..');
});