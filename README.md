# spi-device-mcp3008

EventEmitter based micro-library using spi-device to access a MCP3008 on Raspberry PI and others. Based on [mcp-spi-adc][1] by [@fivdi][2]

This library might fail to install on other platforms!

**Please note: This is provided as is and probably not properly maintained, it should work fine if you have node >= 6.**



## Usage

```js
    const spiDeviceMcp3008 = require('spi-device-mcp3008');
    const myMcp3008 = spiDeviceMcp3008(0, 0, 0); // channel 0 of /dev/spidev0.0

    myMcp3008
    .on('read', (value, raw) => {
        console.log(value, raw);
    })
    .on('error', err => console.error(err));

    myMcp3008.poll(500); // triggers `read` every 500ms
```

## API

### spiDeviceMcp3008(channel, [bus], [device], [speedHz])

Connect to a MCP3008 via SPI.

- `channel` number of the channel on your MCP3008 *must be provided*
- `bus` SPI bus (ie. 1 if you use /dev/spidev1.2) **default: 0**
- `device`  SPI device (CE) (ie. 2 if you use /dev/spidev1.2) **default: 0**
- `speedHz` SPI clock frequency **default 1350000** (via [fivdi][3])

See [Source of index.js](https://github.com/pichfl/spi-device-mcp3008/blob/master/index.js) for further references.


### spiDeviceMcp3008().read()

Trigger a single `read` event.


### spiDeviceMcp3008().poll(delay)

- `delay` a delay for the polling interval in milliseconds **default: 200**

Call `.poll()` on an spiDeviceMcp3008 instance to emit `read` events.


### spiDeviceMcp3008().stop()

Stop polling.


### spiDeviceMcp3008().close()

Close the SPI bus instance.


### spiDeviceMcp3008().on('read', callback)

Passes `value` and `raw` to the callback every time a reading occurs, either by calling `.read()` or using `.poll()`;




## License

MIT. See LICENSE file.


[1]: https://github.com/fivdi/mcp-spi-adc
[2]: https://github.com/fivdi
[3]: https://github.com/fivdi/mcp-spi-adc/blob/9befc01cc4806a1bf924e0acb31fc6505f9fdde4/mcp-spi-adc.js#L9
