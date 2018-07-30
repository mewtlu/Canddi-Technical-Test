/*
 * function getAndStoreData - should take either a page body as string or a link, which will then be read and scraped for a few different pieces of data
 * @param <object> userData - Object containing user info
 * @param <string/undefined> body - Body of HTML page or undefined
 * @param <string/undefined> link - Link to HTML page or undefined
 */
function getAndStoreData (userData, body, link) {
	if (body && body.length > 0) {
		/* if we already have the page body */
		knwlInst.init(body);

		//var knwlPlugins = ['betterPhones', 'emails', 'places'];
		var knwlPlugins = ['betterPhones', 'emails'];
		for (p in knwlPlugins) {
			var plugin = knwlPlugins[p];
			var data = knwlInst.get(plugin);

			if (userData[plugin]) {
				for (k in data) {
					if (plugin === 'emails') {
						if (userData['emails'].indexOf(data[k]['address']) === -1) {
							userData['emails'].push(data[k]['address']);
						}
					} else {
						if (userData[plugin].indexOf(data[k]) === -1) {
							userData[plugin].push(data[k]);
						}
						//userData[plugin].push(data[k]);
					}
				}
			} else {
				userData[plugin] = [];
			} 
			
			userData.toStore -= 1;

			/* Once we've stored all the data we needed to, can output it */
			if (userData.toStore === 0) {
				console.log('Finished scraping ' + userData.site + '! Results:\n\n');
				

				var resultsOutStr = 'Emails:\n';
				for (var e in userData.emails) {
					resultsOutStr += '\t' + userData.emails[e] + '\n';
				}
				resultsOutStr += 'Phones:\n';
				for (var p in userData.betterPhones) {
					resultsOutStr += '\t' + userData.betterPhones[p] + '\n';
				}
				resultsOutStr += 'Links:\n';
				mainLinkLoop:
				for (var l in userData['links']) {
					if (userData['links'][l].substr(0, 1) === '/') {
						delete userData['links'][l];
					} else {
						var socials = ['facebook', 'plus.google', 'twitter', 'linkedin', 'youtube'];
						var socialsRegEx = new RegExp(socials.join('|'));

						for (s2 in socials) {
							if (socialsRegEx.test(userData['links'][l])) {
								userData.socials.push(userData['links'][l]);
								delete userData['links'][l];
								continue mainLinkLoop;
							}
						}

						resultsOutStr += '\t' + userData['links'][l] + '\n';
					}
				}
				resultsOutStr += 'Socials:\n';
				for (var s in userData.socials) {
					resultsOutStr += '\t' + userData.socials[s] + '\n';
				}
				/*
				resultsOutStr += 'Places:\n';
				for (var pl in userData.places) {
					resultsOutStr += '\t' + userData.places[pl] + '\n';
				}
				if (userData.places.length === 0) {
					resultsOutStr += '\tNo places...';
				}
				*/
				/*
				resultsOutStr += 'Pricing Plans:\n';
				for (e in userData['pricingPlans']) {
					resultsOutStr += '\t' + userData['pricingPlans'][e] + '\n';
				}
				*/

				console.log(resultsOutStr);

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
	userData.toStore += 1;

	request(link, function(error, result, body) {
		var $ = cheerio.load(body);

		$('a').each(function(e) {
			var href = $(this).attr('href');

			if (href && !contains(userData.site + href, siteMap)) {
				addToSiteMap(siteMap, userData, href);
			}
		});

		/*
		console.log(link);
		$('ul.pricing-plan').each(function(e) {
			console.log('foundOne');
			var pricingPlanData = {
				price: $(this).find('pricing-plan-price')
			};
			userData.pricingPlans.push(pricingPlanData);
		});
		*/

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
	} else {
		/* Add external links to userData.links */
		if (link.substr(0, 1) !== '#' && link.search('javascript:') === -1 && link.search('tel:') === -1) {
			userData['links'].push(link);
		}
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

knwlInst.register('betterPhones', require('./lib/knwlPhones.js'));

var args = process.argv;
var userData = {
	toStore: 0,
	pricingPlans: [],
	links: [],
	emails: [],
	places: [],
	phones: [],
	socials: []
};

if (args.length > 2) {
	userData.email = args[2];
}


if (userData.email) {
	scrapeSiteFromEmail(userData, userData.email);
} else {
	console.log('Please enter an email address as a command line argument.');
}
