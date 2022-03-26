const path = require('path');

const {HttpProxy, SocksProxy, ProxyChecker} = require(path.dirname(__filename) + '/..' + '/src/index.js');


(async () => {
    const timeout = 7500;
    const concurrency = 30;
    
    const proxies = [];
    proxies.push(new HttpProxy('112.6.117.178', '8085'));
    proxies.push(new SocksProxy('5.153.140.180', '4145'));


    const proxyChecker = new ProxyChecker(proxies, {
        concurrency: concurrency,
        timeout: timeout,
        verbose: true
    })

    await proxyChecker.checkProxies();
    let proxiesUp = proxyChecker.getProxiesUp();
    console.log(`There are ${proxiesUp.length} proxies UP:`);
    console.log(proxiesUp);

    // add 2 new proxies
    proxyChecker.addProxies([new HttpProxy('118.6.117.178', '8082'), new SocksProxy('8.123.170.180', '4125')]);
    // Re-run check on all proxies, included new one recently added
    await proxyChecker.checkProxies();
    proxiesUp = proxyChecker.getProxiesUp();
    

})();