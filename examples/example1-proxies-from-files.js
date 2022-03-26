const fs = require('fs');
const path = require('path');

const {HttpProxy, SocksProxy, ProxyChecker} = require(path.dirname(__filename) + '/..' + '/src/index.js');


function readProxyFile(filePath, proxyProtocol) {
    return fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(row => {
            const [host, port] = row.replace(/\r/g, '').split(':');

            if (proxyProtocol === 'http') {
                return new HttpProxy(host, port);
            } else if (proxyProtocol.startsWith('socks')) {
                return new SocksProxy(host, port);
            }
        })
}

(async () => {
    const timeout = 7500;
    const concurrency = 30;

    const proxies = readProxyFile(path.dirname(__filename) + '/data/http_proxies.txt', 'http').slice(0, 185);
    proxies.push(...readProxyFile(path.dirname(__filename) + '/data/socks4_proxies.txt', 'socks4').slice(0, 50));
    proxies.push(...readProxyFile(path.dirname(__filename) + '/data/socks5_proxies.txt', 'socks5').slice(0, 150));

    const proxyChecker = new ProxyChecker(proxies, {
        concurrency: concurrency,
        timeout: timeout,
        verbose: true
    })

    await proxyChecker.checkProxies();
    const proxiesUp = proxyChecker.getProxiesUp();
    console.log(`There are ${proxiesUp.length} proxies UP:`);
    console.log(proxiesUp);


})();