const path = require('path');

const {ProxyChecker, ProxyScrapeDownloader, FoxtoolsDownloader, FreeProxyListDownloader, downloadAllProxies} = require(path.dirname(__filename) + '/..' + '/src/index.js');

(async () => {
    // You can download proxies from a particular proxy provider, e.g. proxyscrape, foxtools or freeproxylist
    const proxyScrapeDownloader = new ProxyScrapeDownloader();
    const proxyScrapeProxies = await proxyScrapeDownloader.download();
    console.log(proxyScrapeProxies);

    const foxtoolsDownloader = new FoxtoolsDownloader();
    const foxtoolsProxies = await foxtoolsDownloader.download();
    console.log(foxtoolsProxies);

    const freeProxyListDownloader = new FreeProxyListDownloader();
    const freeProxyListProxies = await freeProxyListDownloader.download();
    console.log(freeProxyListProxies);

    // You can also download all proxies from all proxy providers at once
    const allProxies = await downloadAllProxies();
    console.log(allProxies);

    // Then, we can check the availability of the proxies we downloaded
    const proxyChecker = new ProxyChecker(allProxies, {
        concurrency: 25,
        timeout: 7500,
        verbose: true
    })

    await proxyChecker.checkProxies();
    const proxiesUp = proxyChecker.getProxiesUp();
    console.log(`There are ${proxiesUp.length} proxies UP:`);
    console.log(proxiesUp);
})();