const promiseTimeout = (promise, ms, msg) => {
    let id;

    if (!msg) {
        msg = "Promise timed out";
    }

    let timeout = new Promise((resolve, reject) => {
        id = setTimeout(reject, ms, msg);
    });

    return Promise.race([ promise, timeout ]).then(result => {
        clearTimeout(id);
        return result;
    });
}

export default promiseTimeout;
