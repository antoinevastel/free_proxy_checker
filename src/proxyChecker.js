const { Pool } = require("./pool");

class ProxyChecker {
    constructor(proxies, options) {
        this.proxies = proxies;
        this.lastCheck = null;
        this.options = options || {};

        if (!this.options.concurrency) {
            this.options.concurrency = 1
        }

        if (!this.options.timeout) {
            this.options.timeout = 7500
        }

        if (typeof this.options.verbose === 'undefined') {
            this.options.verbose = false
        }
    }

    async checkProxies() {
        this.lastCheck = Date.now();
        const pool = new Pool(this.options.concurrency);

        let numProxiesChecked = 0;
        this.proxies.forEach((proxy) => {
            pool.addTask(async() => {
                try {
                    await proxy._testConnection(this.options.timeout);
                } catch (_) { }
                finally {
                    numProxiesChecked++;

                    if (this.options.verbose && numProxiesChecked % 10 === 0) {
                        console.log(`Checking proxies: ${numProxiesChecked}/${this.proxies.length}`);
                    }
                }
            })
        })

        await pool.run();
    }

    getProxiesUp() {
        return this.proxies.filter(proxy => {
            return proxy.isUp;
        })
    }

    addProxies(proxies) {
        console.log(typeof proxies);
        this.proxies = this.proxies.concat(proxies);
    }

}

module.exports.ProxyChecker = ProxyChecker;