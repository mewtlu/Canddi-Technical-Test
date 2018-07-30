module.exports = function (knwlInstance) {
	this.languages = { //supported languages
		english: true	
	};
	
	this.calls = function() {
		
		var words = knwlInstance.words.get('words'); //get the String as an array of words
		var resultsArray = [];
		var results = [];
		var phoneNumber = '';
		
		for (var w in words) {
			var word = words[w];
			word = word.replace(/[()<>\/\'\+\-a-zA-Z]/g, ' ');
			wordSplit = word.split(' ');

			for (var w2 in wordSplit) {
				if (wordSplit[w2].match(/[1-9]/)) {
					phoneNumber += wordSplit[w2];
				} else {
					if (phoneNumber !== '') {
						if (/^\d{12,13}$/.test(phoneNumber)) {
							resultsArray.push(phoneNumber);
						}
					}
					phoneNumber = '';
				}
			}
		}

		/* Remove duplicates */
		for (var r in resultsArray) {
			if (results.indexOf(resultsArray[r]) === -1) {
				//console.log('\n\n', resultsArray[r], results.indexOf(resultsArray[r]) === -1, results, '\n\n');
				phoneNumber = '+(' + resultsArray[r].substr(0, 2) + ') ' + resultsArray[r].substr(2, 5) + ' ' + resultsArray[r].substr(7, resultsArray[r].length - 1)
				results.push(phoneNumber);
			}
		}

	    return results;
	};
}