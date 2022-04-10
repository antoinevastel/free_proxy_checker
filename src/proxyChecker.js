const { Pool } = require("./pool");
const ProgressBar = require('../lib/node-progress.js');

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
        } else if (this.options.verbose) {
            this.progressBar = new ProgressBar('Checking proxies [:bar] :percent :etas', {
                complete: '=',
                incomplete: ' ',
                width: 20,
                total: this.proxies.length
            });
        }
    }

    async checkProxies() {
        this.lastCheck = Date.now();
        const pool = new Pool(this.options.concurrency);

        this.proxies.forEach((proxy) => {
            pool.addTask(async() => {
                try {
                    await proxy._testConnection(this.options.timeout);
                } catch (_) { }
                finally {
                    if (this.options.verbose) {
                        if (this.options.verbose) {
                            this.progressBar.tick();
                        }
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