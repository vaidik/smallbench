# SmallBench

SmallBench is an attempt to create a tool simple enough to easily do backend
performance testing.

# Usage

```js

var b = require('bench');

// same as options for http or https module's request method
// refer to http://nodejs.org/api/http.html#http_http_request_options_callback
var http_options = {
    host: 'google.com', // complete URL including the protocol part
    port: 80,
    path: '/',
    method: 'GET',
};

var options = {
    requests: 100,
    concurrency: 100,

    protocol: 'HTTP', // or HTTPS
    'http_options': http_options,
};

b.test(options, function(result) {
    // result is an object
    // do something with the result here
});

```
