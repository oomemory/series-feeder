# series-feeder

Automatic RSS feeder creator for some popular Spanish torrent sites

## Synopsis

This tiny project creates an extremely simple web server using node.js and express to parse web pages that list series in some popular Spanish torrent sites, and return back a valid RSS feed (an XML document containing episode title, link associated with the torrent file and the date when it was published).

## Code Example

Run the project:

node index.js

Test everything is working loading any of the valid routes in your favorite browser. Currently these are the supported routes:

http://localhost:8000/mejortorrent/series

http://localhost:8000/elitetorrent/series

http://localhost:8000/todotorrents/series

Usually you will run this server in the same system running your torrent client (for example, a Raspberry PI or a NAS appliance). Consider using some node process manager (such as pm2) to run it as a daemon (see http://pm2.keymetrics.io).

## Motivation

This server can be use to automate the discovering and downloading of new episodes from popular Spanish torrent sites, using Flexget (https://flexget.com). Just configure the rss plugin, and use as RSS feeders the routes to the server.

## API Reference

There are only three valid routes:

http://localhost:8000/mejortorrent/series

http://localhost:8000/elitetorrent/series

http://localhost:8000/todotorrents/series

Any other route will be answered back with a 404 error.

## Contributors

If you like this and want to contribute with more scrapers, feel free to create a new branch.

## License

This code is licensed under GPL-3 license. It is just a sample of node/express capabilities, and its main purpose is only educational.
