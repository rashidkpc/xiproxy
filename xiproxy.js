#!/usr/bin/env node

var http = require('http');
var argv = process.argv;

if (argv.length < 3) {
  console.error("usage: xiproxy <domain> [address]");
  process.exit(1);
}

var domain = argv[2];
var address = argv[3] || null;

http.createServer(function(request, response) {

  host = request.headers['host'].toLowerCase();
  offset = host.length - domain.length;
  if (domain === host.slice(offset)) {
    subdomain = 0 >= offset ? null : host.slice(0, offset - 1);
    subdomain = subdomain.split('.');
    ip = subdomain.splice(-4,4).join('.');
    new_host = subdomain.join('.')

    // Modify Headers
    // delete request.headers['accept-encoding'];
    request.url = request.url.replace(
      'http://'+request.headers['host'],
      'http://'+new_host);
    request.headers['host'] = new_host;

    if (typeof request.headers['referer'] !== 'undefined') {
      request.headers['referer'] = request.headers['referer'].replace(
        'http://'+request.headers['host'],
        'http://'+new_host);
    }

  } else {
    console.log('Invalid Domain');
    response.statusCode = 500;
    response.end();
    return;
  }

  var proxy = http.createClient(80, ip)
  var proxy_request = proxy.request(request.method, request.url, request.headers);
  var responseBody = "";

  proxy.on('error', function(err) {
    console.log(err);
    response.statusCode = 500;
    response.end();
  });

  proxy_request.on('response', function (proxy_response) {

    if (typeof proxy_response.headers['location'] !== 'undefined') {
      proxy_response.headers['location'] = proxy_response.headers['location'].replace(
        'http://'+request.headers['host'],
        'http://'+host);
    }

    proxy_response.on('data', function(chunk) {
      response.write(chunk);
    });

    proxy_response.on('end', function() {
      response.end();
    });

    response.writeHead(proxy_response.statusCode, proxy_response.headers);
  });

  request.on('data', function(chunk) {
    proxy_request.write(chunk, 'binary');
  });

  request.on('end', function() {
    proxy_request.end();
  });

}).listen(80, address);