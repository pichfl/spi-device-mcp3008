const EventEmitter = require('events').EventEmitter;
const spiDevice = require('spi-device');

// Based on code from https://github.com/fivdi/mcp-spi-adc
const defaultHz = 1350000; // See MCP3008 datasheet. 75000 * 18 = 1350000.

/**
 * Creates a new EventEmitter reading an MCP3008 connected via the selected SPI device
 * @param {Number} channel number of the channel on the MCP
 * @param {Number} bus     the SPI bus (SPIn)
 * @param {Number} device  the SPI device (CE)
 * @param {[type]} speedHz SPI clock frequency with sensible default (via fivdi)
 */
function SpiDeviceMcp3008(channel, bus = 0, device = 0, speedHz = defaultHz) {
	if (!Number.isInteger(channel) || channel < 0 || channel > 7) {
		throw new RangeError(`${channel} is not a valid channel (0-7)`);
	}

	this._mcp3008 = new Promise((resolve, reject) => {
		const mcp3008 = spiDevice.open(bus, device, err => {
			if (err) {
				reject(err);
			}

			resolve(mcp3008);
		});
	});

	// Export params
	this.channel = channel;
	this.bus = bus;
	this.device = device;
	this.speedHz = speedHz;

	this._sendBuffer = new Buffer([0x01, 0x80 + (channel << 4), 0x00]);

	return this;
}

SpiDeviceMcp3008.prototype = EventEmitter.prototype;

SpiDeviceMcp3008.prototype._read = function _read(mcp3008, cb) {
	mcp3008.transfer([{
		byteLength: 3,
		sendBuffer: this._sendBuffer,
		receiveBuffer: Buffer.alloc(3),
		speedHz: this.speedHz,
	}], (err, message) => {
		if (err) {
			this.emit('error', err);

			return;
		}

		const raw = ((message[0].receiveBuffer[1] & 0x03) << 8) + message[0].receiveBuffer[2];
		const value = raw / 1023;

		cb(value, raw);
	});
};

SpiDeviceMcp3008.prototype.read = function read() {
	this._mcp3008
	.then(mcp3008 => this._read(mcp3008, (value, raw) => this.emit('read', value, raw)));

	return this;
};

SpiDeviceMcp3008.prototype.poll = function poll(delay = 200) {
	this._mcp3008
	.then(mcp3008 => {
		this._interval = setInterval(() =>
			this._read(mcp3008, (value, raw) =>
				this.emit('read', value, raw)), delay);
	});

	return this;
};

SpiDeviceMcp3008.prototype.stop = function stop() {
	if (this._interval) {
		clearInterval(this._interval);
	}

	return this;
};

SpiDeviceMcp3008.prototype.close = function close(cb) {
	this._mcp3008.then(mcp => mcp.close(cb));

	return null;
};

module.exports = function spiDeviceMcp3008(channel, bus, device, poll, speedHz) {
	return new SpiDeviceMcp3008(channel, bus, device, poll, speedHz);
};
