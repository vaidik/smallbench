var url = require('url');

var slice = 1;
if (process.argv[0] == 'node') {
    slice = 2;
}

var args = process.argv.slice(slice);

var options = {
    requests: ['-n'],
    concurrency: ['-c'],
    method: ['-X'],
}

var test_options = {
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

var data = {};
for (var i=0; i<args.length; i++) {
    for (op in options) {
        if (args[i] == options[op]) {
            test_options[op] = args[i+1];
        }
    }

    if (args[i] == "-X") {
        test_options.http_options.method = args[i+1];
    }

    if (args[i] == "-d") {
        var split_data = args[i+1].split("=");
        data[split_data[0]] = split_data[1];
    }

    var parsed = url.parse(args[i]);
    if (parsed.protocol) {
        if (parsed.protocol.toUpperCase() == 'HTTP:' || parsed.protocol.toUpperCase() == 'HTTPS:') {
            test_options.protocol = parsed.protocol.replace(/:$/g, "");
            test_options.http_options.host = parsed.host;
            test_options.http_options.path = parsed.path;
            if (parsed.port) {
                test_options.http_options.port = parsed.port;
            }
        }
    }
}

function show_results(res) {
    var ops = test_options;
    var sum_total = 0;
    var sum_processing = 0;
    var sum_connection = 0;
    for (var i=0;i<ops.requests;i++) {
        sum_total += res.time.total[i];
        sum_connection += res.time.connection[i];
        sum_processing += res.time.processing[i];
    }

    console.log('Concurrency level:\t' + ops.concurrency);
    console.log('Time taken for tests:\t' + res.computed.test_time.value, res.computed.test_time.unit);

    console.log('Complete requests:\t' + res.computed.complete_requests.value);
    console.log('Non 2xx requests:\t' + res.computed.non_200.value);
    console.log('Failed requests:\t' + res.computed.failed_requests.value);
    console.log('Time per request:\t' + res.computed.time_per_request.value, res.computed.time_per_request.unit);

    console.log('Requests per second:\t' + Math.round(res.computed.request_per_second.value*100)/100, res.computed.time_per_request.unit);

    console.log(' ');

    console.log('Average Connection:\t' + res.computed.average_connection_time.value, res.computed.average_connection_time.unit);
    console.log('Average Processing:\t' + res.computed.average_processing_time.value, res.computed.average_processing_time.unit);
    console.log('Average Total:\t\t' + res.computed.average_total_time.value, res.computed.average_total_time.unit);

    console.log('Percentage of the requests served within a certain time (ms):');
    var total_sorted = res.time.total.sort(function(a,b){return a-b});
    for (var i = 50; i <= 100; i += 10) {
        console.log('\t' + i + '%\t' + total_sorted[Math.round(ops.requests*(i/100))-1]);
    }
}

var sb = require('./smallbench.js');

/**
 * Checks if an object is empty or not.
 */
Object.prototype.isEmpty = function() {
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

if (!data.isEmpty()) {
    var querystring = require('querystring');
    var post_data = querystring.stringify(data);
    test_options.http_options.data = post_data;
    test_options.http_options.headers =  {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': post_data.length
    }
};

sb.test(test_options, show_results);
console.log('Beginning tests. Please wait...\n');
