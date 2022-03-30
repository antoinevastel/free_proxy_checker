const http = require("http");
const net = require('net');

/**
 * Abstract Class Proxy.
 *
 * @class Proxy
 */
class Proxy {
    constructor(host, port) {
        if (this._isValidHost(host)) {
            this.host = host;
            this.port = port;
            this.isUp = null;
        } else {
            throw new Error('Host provided is not a valid IP address');
        }
        

        if (this.constructor === Proxy) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    _isValidHost(ipAddress) {
        return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress))
    }

    async _testConnection(timeout) {
        throw new Error("Method '_testConnection()' must be implemented.");
    }

}

class HttpProxy extends Proxy {
    constructor(host, port) {
        super(host, port);
    }

    async _testConnection(timeout) {
        return new Promise((resolve, reject) => {
            const req = http.request({
                host: this.host,
                port: this.port,
                method: 'CONNECT',
                path: `example.com:80`,
                timeout: timeout
            }).on('connect', (res, socket) => {
                if (res.statusCode === 200) {
                    // We only care about response 200
                    // If proxy is UP but can't handle our request, we consider it as down
                    this.isUp = true;
                    socket.destroy();
                    return resolve(true);
                }
                socket.destroy();
                return reject(false)
            }).on('error', () => {
                this.isUp = false;
                return reject(false);
            }).on('timeout', () => {
                this.isUp = false;
                // Emitted when the underlying socket times out from inactivity. This only notifies that the socket has been idle. The request must be destroyed manually.
                req.destroy();
                return reject(false);
            })
                .end();
        });
    }
}

class SocksProxy extends Proxy {
    constructor(host, port) {
        super(host, port);
    }

    async _testConnection(timeout) {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            socket.setTimeout(timeout);
            socket.connect(this.port, this.host);

            socket.on('connect', () => {
                this.isUp = true;
                socket.destroy();
                return resolve(true);
            }).on('error', () => {
                this.isUp = false;
                socket.destroy();
                return reject(false);
            }).on('timeout', () => {
                this.isUp = false;
                // Emitted when the underlying socket times out from inactivity. This only notifies that the socket has been idle. The request must be destroyed manually.
                socket.destroy();
                return reject(false);
            })
        })
    }
}

module.exports.HttpProxy = HttpProxy;
module.exports.SocksProxy = SocksProxy;
