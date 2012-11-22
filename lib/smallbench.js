// options object
var options = {
    requests: 100,
    concurrency: 1,
    protocol: 'HTTP', // or HTTPS
    http_options: {
        host: '',
        port: 80,
        path: '/',
        method: 'GET',
    }
};

var queue = 0;
var remaining = 0;
var total = [];
var processing = [];
var connection = [];
var test_time = 0;

var test = function(user_options, callback) {
    if (!user_options || typeof user_options != 'object') {
        log('Error: Provide valid options');
        return;
    }

    var ops = options;
    for (propt in user_options) {
        ops[propt] = user_options[propt];
    }

    ops.protocol = ops.protocol.toLowerCase();
    if (ops.protocol != 'http' && ops.protocol != 'https') {
        log('Error: protocol can be either HTTP or HTTPS')
        return;
    }

    remaining = ops.requests;

    // require http or https module depending upon the specified protocol
    test_time = new Date();
    send_request(ops, callback);

    var results = [];
    log(ops);
}

var i =0;
var send_request = function(ops, callback) {
    if (queue >= ops.concurrency || remaining == 0) {
        return;
    }

    i++;
    queue += 1;
    remaining -= 1;

    log('queue: ' + queue + '; remaining: ' + remaining);
    var http = require(ops.protocol);
    http.globalAgent = ops.concurrency;
    var start = new Date();
    var processing_start = 0;
    var req = http.request(ops.http_options, function(res) {
        res.setEncoding('utf8');
        res.on('end', function(chunk) {
            log('ending ' + i);
            queue -= 1;
            var end = new Date();
            log('start:' + start.getTime() + '; end: ' + end.getTime());
            processing.push(end - processing_start);
            total.push(end - start);
            log('Results', total.length + '; queue: ' + queue + '; remaining: ' + remaining);
            if (total.length == ops.requests) {
                test_time = new Date() - test_time;
                log('Completed everything. Yay!!!');
                compute_basic(ops, callback);
            } else {
                send_request(ops, callback);
            }
        });
    })
    req.end();

    req.on('socket', function() {
        processing_start = new Date();
        connection.push(processing_start - start);
    });

    send_request(ops, callback);
}

var compute_basic = function(ops, callback) {
    var sum_total = 0;
    var sum_connection = 0;
    var sum_processing = 0;

    var final_results = {};
    final_results.time = {}
    final_results.time.total = total;
    final_results.time.connection = connection;
    final_results.time.processing = processing;
    

    for (var i=0;i<ops.requests;i++) {
        sum_total += total[i];
        sum_connection += connection[i];
        sum_processing += processing[i];
    }

    final_results.computed = {};
    final_results.computed.test_time = {
        value: test_time/1000,
        unit: 'seconds',
    }
    final_results.computed.complete_requests = {
        value: ops.requests,
        unit: '',
    }
    final_results.computed.failed_requests = {
        value: 0,
        unit: '',
    }
    final_results.computed.time_per_request = {
        value: sum_total/ops.requests,
        unit: 'ms',
    }
    final_results.computed.request_per_second = {
        value: ops.requests/(sum_total/1000),
        unit: '/seconds',
    }


    final_results.computed.average_connection_time = {
        value: sum_connection/ops.requests,
        unit: 'ms',
    }

    final_results.computed.average_processing_time = {
        value: sum_processing/ops.requests,
        unit: 'ms',
    }

    final_results.computed.average_total_time = {
        value: sum_total/ops.requests,
        unit: 'ms',
    }

    if (typeof callback == 'function') {
        callback(final_results);
    }
    
    return;
}

function log(content) {
    //console.log(content);
    ;
}

/**
 * All the module exports come here
 */

exports.test = test
