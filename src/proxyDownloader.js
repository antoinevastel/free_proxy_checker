const https = require('https');
const http = require('http');
const net = require('net');
const { HttpProxy, SocksProxy } = require('./proxies.js');

/**
 * Abstract Class ProxyDownloader.
 *
 * @class ProxyDownloader
 */
class ProxyDownloader {
    constructor() {
        if (this.constructor === ProxyDownloader) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.headers = {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US;q=0.8,en;q=0.7",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"99\", \"Google Chrome\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4744.74 Safari/537.36"
        }
    }

    async download() {
        throw new Error("Method 'download()' must be implemented.");
    }

    async _getURL(url) {
        return new Promise((resolve, reject) => {
            const urlParsed = new URL(url);

            let client = urlParsed.protocol === 'http:' ? http : https;
            const request = client.request(url, { headers: this.headers }, (res) => {
                let data = ""

                res.on("data", d => {
                    data += d
                })

                res.on("end", () => {
                    resolve(data);
                })

                res.on("error", (err) => {
                    reject(err);
                })
            })

            request.on('error', (err) => {
                reject(err);
            });

            request.end();
        })
    }

}

class ProxyScrapeDownloader extends ProxyDownloader {
    constructor() {
        super();
        this.name = 'Proxyscrape';
    }

    async download() {
        const proxies = [];
        try {
            const httpProxiesContent = await this._getURL('https://api.proxyscrape.com/?request=getproxies&proxytype=http&timeout=10000&country=all&ssl=all&anonymity=all');
            const socks4ProxiesContent = await this._getURL('https://api.proxyscrape.com/?request=getproxies&proxytype=socks4&timeout=10000&country=all');
            const socks5ProxiesContent = await this._getURL('https://api.proxyscrape.com/?request=getproxies&proxytype=socks5&timeout=10000&country=all');

            httpProxiesContent.split('\n')
                .filter(Boolean)
                .forEach(row => {
                    const [host, port] = row.replace(/\r/g, '').split(':');
                    if (net.isIP(host)) {
                        proxies.push(new HttpProxy(host, port));
                    }
                })

            socks4ProxiesContent.concat(socks5ProxiesContent).split('\n')
                .filter(Boolean)
                .forEach(row => {
                    const [host, port] = row.replace(/\r/g, '').split(':');
                    if (net.isIP(host)) {
                        proxies.push(new SocksProxy(host, port));
                    }
                })
        } catch (_) {
            console.log(`An error occured while downloading proxies from ${this.name}`);
        } finally {
            return proxies;
        }
    }
}

class FoxtoolsDownloader extends ProxyDownloader {
    constructor() {
        super();
        this.name = 'Foxtools';
    }

    async download() {
        const proxies = [];
        try {
            let hasProxies = true;
            let pageIndex = 1;
            do {
                const proxyPageContent = await this._getURL(`http://api.foxtools.ru/v2/Proxy.txt?page=${pageIndex}`);
                const proxyPageContentSplit = proxyPageContent
                    .replace(/\r/g, '')
                    .split('\n');


                hasProxies = proxyPageContentSplit.length > 5;

                if (hasProxies) {
                    proxyPageContentSplit
                        .filter(Boolean)
                        .filter(row => row.indexOf(' ') === -1)
                        .forEach(row => {
                            try {
                                const [host, port] = row.replace(/\r/g, '').split(':');
                                proxies.push(new HttpProxy(host, port));
                            } catch (_) { }
                        })
                }
                pageIndex++;
            } while (hasProxies);
        } catch (_) {
            console.log(`An error occured while downloading proxies from ${this.name}`);
        }
        finally {
            return proxies;
        }
    }
}

class FreeProxyListDownloader extends ProxyDownloader {
    constructor() {
        super();
        this.name = 'Free proxy list';
    }

    async download() {
        const urls = [
            'https://www.free-proxy-list.net/',
            'https://www.us-proxy.org/',
            'https://free-proxy-list.net/uk-proxy.html',
            'https://www.sslproxies.org/',
            'https://free-proxy-list.net/anonymous-proxy.html'
        ];

        let proxies = [];
        for (let url of urls) {
            try {
                const proxyPageContent = await this._getURL(url);
                const indexStartProxiesTable = proxyPageContent.indexOf('table table-striped table-bordered');
                const indexEndProxiesTable = indexStartProxiesTable + proxyPageContent.slice(indexStartProxiesTable, proxyPageContent.length).indexOf('</table>');
                const startProxiesIndex = 2;
                proxyPageContent.slice(indexStartProxiesTable, indexEndProxiesTable)
                    .split('<tr>')
                    .slice(startProxiesIndex)
                    .forEach((row) => {
                        const rowSplit = row.split('<td>');
                        const host = rowSplit[1].replace('</td>', '');
                        const port = rowSplit[2].replace('</td>', '');
                        if (net.isIP(host)) {
                            proxies.push(new HttpProxy(host, port));
                        }
                    })
            } catch (_) {
                console.log(`An error occured while downloading proxies from ${this.name}`);
            }
        }

        return proxies;
    }
}

class MyProxyDownloader extends ProxyDownloader {
    constructor() {
        super();
        this.name = 'My proxy';
    }

    async download() {
        const urls = [
            'https://www.my-proxy.com/free-proxy-list.html',
            'https://www.my-proxy.com/free-proxy-list-2.html',
            'https://www.my-proxy.com/free-proxy-list-3.html',
            'https://www.my-proxy.com/free-proxy-list-4.html',
            'https://www.my-proxy.com/free-proxy-list-5.html',
            'https://www.my-proxy.com/free-proxy-list-6.html',
            'https://www.my-proxy.com/free-proxy-list-7.html',
            'https://www.my-proxy.com/free-proxy-list-8.html',
            'https://www.my-proxy.com/free-proxy-list-9.html',
            'https://www.my-proxy.com/free-proxy-list-10.html',
            'https://www.my-proxy.com/free-elite-proxy.html',
            'https://www.my-proxy.com/free-anonymous-proxy.html',
            'https://www.my-proxy.com/free-socks-4-proxy.html',
            'https://www.my-proxy.com/free-socks-5-proxy.html',
        ];

        let proxies = [];
        for (let url of urls) {
            try {
                const proxyPageContent = await this._getURL(url);
                const indexStartProxiesDiv = proxyPageContent.indexOf('<div class="list"');
                const indexEndProxiesDiv = indexStartProxiesDiv + proxyPageContent.slice(indexStartProxiesDiv, proxyPageContent.length).indexOf('</div>');
                proxyPageContent.slice(indexStartProxiesDiv, indexEndProxiesDiv).replace('<div class="list">', '').replace("<div class='to-lock'>", '')
                    .split('<br>')
                    .filter(Boolean)
                    .forEach((row) => {
                        const rowSplit = row.split(':');
                        const host = rowSplit[0]
                        const port = rowSplit[1].split('#')[0];
                        if (net.isIP(host)) {
                            if (url.indexOf('sock') > -1) {
                                proxies.push(new SocksProxy(host, port));
                            } else {
                                proxies.push(new HttpProxy(host, port));
                            }
                        }
                    })
            } catch (_) {
                console.log(`An error occured while downloading proxies from ${this.name}`);
            }
        }

        return proxies;
    }
}

class GeonodeDownloader extends ProxyDownloader {
    constructor() {
        super();
        this.name = 'Geonode';
    }

    async download() {

        const geonodeProxyContent = await this._getURL('https://proxylist.geonode.com/api/proxy-list?limit=150&page=1&sort_by=speed&sort_type=asc');
        const proxies = [];
        try {
            const proxiesInfo = JSON.parse(geonodeProxyContent);
            proxiesInfo.data.forEach(proxyInfo => {
                proxyInfo.protocols.forEach(protocol => {
                    if (protocol.indexOf('socks') > -1) {
                        proxies.push(new SocksProxy(proxyInfo.ip, proxyInfo.port))
                    } else if (protocol.indexOf('http') > -1) {
                        proxies.push(new HttpProxy(proxyInfo.ip, proxyInfo.port))
                    }
                })
            })
        } catch (_) {
            console.log(`An error occured while downloading proxies from ${this.name}`);
        } finally {
            return proxies;
        }
    }
}

class SpysMeDownloader extends ProxyDownloader {
    constructor() {
        super();
        this.name = 'Spys me';
    }

    async download() {
        const spysmeProxyContent = await this._getURL('https://spys.me/proxy.txt');
        const proxies = [];
        let parseContent = false;
        try {
            spysmeProxyContent.split('\n')
                .forEach((line) => {
                    if (parseContent && line.indexOf(':') > -1) {
                        const [host, port] = line.split(' ')[0].split(':');
                        if (net.isIP(host)) {
                            proxies.push(new SocksProxy(host, port));
                        }
                    }

                    if (line.length < 1) {
                        parseContent = true;
                    }
                })
        } catch (_) {
            console.log(`An error occured while downloading proxies from ${this.name}`);
        } finally {
            return proxies;
        }
    }
}

async function downloadAllProxies() {
    const proxyScrapeDownloader = new ProxyScrapeDownloader();
    const foxtoolsDownloader = new FoxtoolsDownloader();
    const freeProxyListDownloader = new FreeProxyListDownloader();
    const myProxyDownloader = new MyProxyDownloader();
    const geonodeDownloader = new GeonodeDownloader();
    const spysMeDownloader = new SpysMeDownloader();

    const proxyPromises = await Promise.allSettled([
        proxyScrapeDownloader.download(),
        foxtoolsDownloader.download(),
        freeProxyListDownloader.download(),
        myProxyDownloader.download(),
        geonodeDownloader.download(),
        spysMeDownloader.download(),
    ]);

    const proxies = [];
    const proxiesSeenKeys = new Set();
    proxyPromises.forEach(res => {
        res.value.forEach(v => {
            const proxyKey = v.toString();
            if (!proxiesSeenKeys.has(proxyKey)) {
                proxies.push(v);
                proxiesSeenKeys.add(proxyKey);
            }
        });
    });
    return proxies;
}

module.exports.ProxyScrapeDownloader = ProxyScrapeDownloader;
module.exports.FoxtoolsDownloader = FoxtoolsDownloader;
module.exports.FreeProxyListDownloader = FreeProxyListDownloader;
module.exports.MyProxyDownloader = MyProxyDownloader;
module.exports.GeonodeDownloader = GeonodeDownloader;
module.exports.SpysMeDownloader = SpysMeDownloader;
module.exports.downloadAllProxies = downloadAllProxies;
