# free-proxy_checker
NodeJS library **WITHOUT** any external dependencies to:
- download free proxies;
- check if free HTTP/SOCKS4/SOCKS5 proxies are working/up.


## Proxy testing protocol

### HTTP

To test HTTP proxies, the library makes an `HTTP CONNECT` request to the proxy `host/IP` and `port`.
If the request doesn't generate an error/timeout and if the status code is `200`, we consider the proxy is UP.
We do that to ignore proxies that are up but that ignore/block our request.

### SOCKS4/5

To test SOCKS proxies, we establish create a TCP socket using `net.Socket` and try to establish a connection with the proxy.
If the connection is successful (no error and no timeout), we consider the proxy is UP.

## Library installation
```
npm install free-proxy-checker
```

## Library usage

You can find examples in the `/examples` directory.

## Downloading and testing free proxies

```javascript
const {ProxyChecker, ProxyScrapeDownloader, FoxtoolsDownloader, FreeProxyListDownloader, downloadAllProxies} = require('free-proxy-checker');

(async () => {
    // We can download proxies from a particular proxy provider, e.g. proxyscrape, foxtools, freeproxylist and my proxy
    const proxyScrapeDownloader = new ProxyScrapeDownloader();
    const proxyScrapeProxies = await proxyScrapeDownloader.download();

    const foxtoolsDownloader = new FoxtoolsDownloader();
    const foxtoolsProxies = await foxtoolsDownloader.download();

    // We can also download all proxies from all proxy providers at once
    const allProxies = await downloadAllProxies();

    // Then, we can check the availability of the proxies we downloaded
    // The verbose: true option enables you to see the testing progress and have a time estimate
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
```

## Testing if proxies are UP/DOWN
The code snippet below shows how you can create `HttpProxy` and `SocksProxy` to create proxy instances, and pass them to a `ProxyChecker` to verify their availability.

```javascript
const {HttpProxy, SocksProxy, ProxyChecker} = require('free-proxy-checker');


(async () => {
    const proxies = [];
    proxies.push(new HttpProxy('112.6.117.178', '8085'));
    proxies.push(new SocksProxy('5.153.140.180', '4145'));


    const proxyChecker = new ProxyChecker(proxies, {
        concurrency: 15,
        timeout: 7500,
        verbose: 30
    })

    await proxyChecker.checkProxies();
    let proxiesUp = proxyChecker.getProxiesUp();
    console.log(`There are ${proxiesUp.length} proxies UP:`);
    console.log(proxiesUp);
})();
```

## Remarks

For the moment the library is really basic, it only checks if a proxy is UP/DOWN.
It doesn't store any data about latency.
Feel free to open an issue if you have a feature request. 
I may add it to the library if I feel like it's relevant.

## Related projects

[https://niek.github.io/free-proxy-list/](https://niek.github.io/free-proxy-list/): A page that leverages the free-proxy-checker library to display a list of available proxies. 
Results are updated every hour.