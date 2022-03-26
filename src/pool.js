class Pool {

    // Our pool of tasks takes only 1 parameter: the max concurrency,
    // i.e. the maximum number of tasks executed at the same time
    constructor(concurrency) {
        this.tasks = [];
        this.concurrency = concurrency;
    }

    addTask(task) {
        this.tasks.push(task)
    }

    // Private class method
    async _executeTasks(iterator) {
        for (let [_, task] of iterator) {
            try {
                // Run the task and await for it
                await task();
            } catch (e) {
                console.log(e);
            }

        }
    }

    async run() {
        const iterator = this.tasks.entries();
        const tasksWorkers = new Array(this.concurrency).fill(iterator).map(this._executeTasks);
        await Promise.allSettled(tasksWorkers);
    }
}

module.exports.Pool = Pool;
