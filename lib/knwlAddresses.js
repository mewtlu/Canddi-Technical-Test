module.exports = function (knwlInstance) {
	this.languages = { //supported languages
		english: true	
	};
	
	this.calls = function() {
		
		var words = knwlInstance.words.get('words'); //get the String as an array of words
		var resultsArray = [];
		var results = [];

		for (var w in words) {
			var word = words[w];

			if (/^[A-Za-z]{1,2}[0-9]{1,2}$/.test(word)) {
				var secondPortion = words[Number(w) + 1];
				if(/^[0-9][A-Za-z]{2}$/.test(secondPortion)) {
					var postCode = word + ' ' + secondPortion;

					for (var i = w; i > w - 10; i--) {
						if (/^\d+$/.test(words[i])) {
							var addressLine = words.splice(i, w - i);

							for (var i = 0; i < addressLine.length; i++) {
								addressLine[i] = addressLine[i].charAt(0).toUpperCase() + addressLine[i].slice(1);
							}

							addressLine = addressLine.join(' ')

							address = addressLine + ', ' + postCode.toUpperCase();
						}
					}

					resultsArray.push(address)
				}
			}
		}

		/* Remove duplicates */
		for (var r in resultsArray) {
			if (results.indexOf(resultsArray[r]) === -1) {
				results.push(resultsArray[r]);
			}
		}

	    return results;
	};
}