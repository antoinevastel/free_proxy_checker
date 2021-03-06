const {HttpProxy, SocksProxy} = require('./proxies.js');
const {ProxyChecker} = require('./proxyChecker.js');
const {ProxyScrapeDownloader, FreeProxyListDownloader, FoxtoolsDownloader, MyProxyDownloader, GeonodeDownloader, SpysMeDownloader, downloadAllProxies} = require('./proxyDownloader.js');


module.exports.HttpProxy = HttpProxy;
module.exports.SocksProxy = SocksProxy;
module.exports.ProxyChecker = ProxyChecker;

module.exports.ProxyScrapeDownloader = ProxyScrapeDownloader;
module.exports.FreeProxyListDownloader = FreeProxyListDownloader;
module.exports.FoxtoolsDownloader = FoxtoolsDownloader;
module.exports.MyProxyDownloader = MyProxyDownloader;
module.exports.GeonodeDownloader = GeonodeDownloader;
module.exports.SpysMeDownloader = SpysMeDownloader;
module.exports.downloadAllProxies = downloadAllProxies;
