# free_proxy_checker
NodeJS library **WITHOUT** any external dependencies to check if free HTTP/SOCKS4/SOCKS5 proxies are working/up.

**Warning:** The goal of this library is not to collect free proxies.
You can easily find them on several websites:
- https://proxyscrape.com/free-proxy-list
- https://hidemy.name/en/proxy-list/
- https://openproxy.space/list


## Proxy testing protocol

### HTTP

To test HTTP proxies, the library makes an `HTTP CONNECT` request to the proxy `host/IP` and `port`.
If the request doesn't generate an error/timeout and if the status code is `200`, we consider the proxy is UP.
We do that to ignore proxies that are up but that ignore/block our request.

### SOCKS4/5

To test SOCKS proxies, we establish create a TCP socket using `net.Socket` and try to establish a connection with the proxy.
If the connection is successful (no error and no timeout), we consider the proxy is UP.


## Library usage

You can find examples in the `/examples` directory.

Otherwise, the code snippet below shows how you can create `HttpProxy` and `SocksProxy` to create proxy instances, and pass them to a `ProxyChecker` to verify their availability.

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
