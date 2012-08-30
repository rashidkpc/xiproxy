# xiproxy

A transparent nodejs based HTTP proxy that understand the xip.io hostname 
format and rewrites HTTP headers accordingly. 

xiproxy will take a hostname xip.io hostname format:  
*hostname*.*ipaddress*.some.domain.com  

and send your request to *ipaddress* with the hostname header of *hostname*.
Thus making the web server at *ipaddress* believe that you asked for *hostname*.
For example, something like google.de.74.125.224.206.your.domain.com would load
Google Germany's page, from Google US's webserver. Useful for testing vhosts and
such.

These headers are rewritten (in their respective directions)
  - Host
  - Referrer
  - Location

## Requirements
  - nodejs
  - a server with nothing on port 80
  - DNS server that can do wildcards

## Setup
Point *.your.domain.com to the ipaddress of your xiproxy system  
./xiproxy your.domain.com   
Goto http://google.de.74.125.224.206.your.domain.com or, well, whatever.  

## Limitations
Non relative links on the page won't be rewriten. So if you follow a link you
might leave the realm of the proxy. Redirects that use the  Location: header 
should work, as should relative links. HTTPS does not work.

## Warning
This should really only be used on an intranet DO NOT MAKE THIS INTERNET FACING. 
Xiproxy is an http proxy, an open one. You definitely don't want the outside 
world making http requests through you.
