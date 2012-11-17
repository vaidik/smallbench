// options object
var options = {
    requests: 100,
    concurrency: 100,
    protocol: 'HTTP', // or HTTPS
    http_options: {
        host: '',
        port: 80,
        path: '/',
        method: 'GET',
    }
};


var test = function(user_options) {
    if (!user_options || typeof user_options != 'object') {
        console.log('Error: Provide valid options');
        return;
    }

    var ops = options;
    for (propt in user_options) {
        ops[propt] = user_options[propt];
    }

    ops.protocol = ops.protocol.toLowerCase();
    if (ops.protocol != 'http' && ops.protocol != 'https') {
        console.log('Error: protocol can be either HTTP or HTTPS')
        return;
    }

    // require http or https module depending upon the specified protocol
    var http = require(ops.protocol);

    var results = [];
    var start = new Date();
    for (var i=0;i<ops.requests;i++) {
        console.log(i);
        var req = http.request(ops.http_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                results.push(new Date() - start);
                console.log('Results', results.length);
                if (results.length == ops.requests) {
                    console.log('Completed everything. Yay!!!');
                    compute_basic(ops, results);
                }
            });
        }).end();
    }
    console.log(ops);
}

var computer_basic = function(ops, results) {
    var sum = 0;
    for (var i=0;i<ops.requests;i++) {
        sum += results[i];
    }
    console.log('Average:', sum/ops.requests);
    return;
}

/**
 * All the module exports come here
 */

exports.test = test
