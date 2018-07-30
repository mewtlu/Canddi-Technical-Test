function getAndStoreData (userData, body, link) {
	userData.toStore += 1;
	if (body && body.length > 0) {
		/* if we already have the page body */
		knwlInst.init(body);

		var knwlPlugins = ['phones', 'emails', 'links', 'places'];
		for (p in knwlPlugins) {
			var plugin = knwlPlugins[p];
			var data = knwlInst.get(plugin);

			if (userData[plugin]) {
				for (k in data) {
					if (userData[plugin].indexOf(data[k]) === -1) {
						userData[plugin].push(data[k]);
					}

					//console.log(data[k])
				}
			} else {
				userData[plugin] = data;
			} 
			userData.toStore -= 1;

			if (userData.toStore === 0) {
				console.log(userData);
			}
		}
	} else {
		/* otherwise we'll have to fetch it from link */
		request.get({
			url: userData.site,
			path: link
		}, function(error, result, body) {
			if (body) {
				getAndStoreData(userData, body);
			}
		});
	}
}

/*
 * function contains - Simple method to check if an object has a value with key 'key'
 * @param <string> key - Key to look for in the object
 * @param <object> haystack - Object to look in
 */
contains = function (key, haystack) {
	return !(Object.keys(haystack).indexOf(key) === -1);
}

/*
 * function recursivelyCheckForLinks - Searches through HTML page looking for links and adds them to the sitemap if they're not already in it, then recurses through each.
 * @param <object> siteMap - Object containing all already found pages
 * @param <object> userData - Object containing data about the user
 * @oaram <string> link - Link to check next
 */
function recursivelyCheckForLinks (siteMap, userData, link) {
	var origLink = link;
	if (link.search('http') === -1) {
		link = userData.site + link;
	}

	//console.log('Found ' + link + '...');

	request(link, function(error, result, body) {
		var $ = cheerio.load(body);

		$('a').each(function(e) {
			var href = $(this).attr('href');

			if (href && !contains(userData.site + href, siteMap)) {
				addToSiteMap(siteMap, userData, href);
			}
		});

		siteMap[link] = body;
		getAndStoreData(userData, siteMap[link], origLink);
	});
}

/*
 * function addToSiteMap - Validates a link to check eligibility for adding to the sitemap, and if eligible, does so.
 * @param <object> siteMap - List of pages found on the website
 * @param <string> link - A link to possibly add to the sitemap.
 */
function addToSiteMap (siteMap, userData, link) {
	/*
	 * if first char is '/', link should be to another page
	 *   on the current site (not anchors, external links, etc.)
	 */
	if (link.length > 1 && link.substr(0, 1) === '/') {
		siteMap[userData.site + link] = '';
		
		recursivelyCheckForLinks(siteMap, userData, link);
	}

	return siteMap;
}

/*
 * function scrapeSiteFromEmail - Main program function, retrieves website from email address and performs the main tasks of the program on the site.
 * @param <string> email - Email address to find site from for scraping.
 */
function scrapeSiteFromEmail (userData, email) {
	var siteMap = {};


	userData.site = userData.email.substr(userData.email.search('@') + 1);

	if (userData.site.search('http') === -1) {
		userData.site = 'http://' + userData.site;
	}

	console.log('Finding site for ' + userData.email + '...');
	console.log('Scraping from ' + userData.site + '...');

	recursivelyCheckForLinks(siteMap, userData, userData.site);
}

const request = require('request');
const Knwl = require('knwl.js');
const knwlInst = new Knwl('english');
const cheerio = require('cheerio');

var args = process.argv;
var userData = {
	toStore: 0
};

if (args.length > 2) {
	userData.email = args[2];
}


if (userData.email) {
	scrapeSiteFromEmail(userData, userData.email);
} else {
	console.log('Please enter an email address as a command line argument.');
}
