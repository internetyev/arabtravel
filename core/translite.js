/*!
 * Translite engine
 * Copyright(c) 2016 Wisdman <wisdman@ajaw.it>
 */

module.exports = text =>
	text.replace(
		/([а-яё])|([\s_-])|([^a-z\d])/gi,
		(all, ch, space, words, i) => {
			if (space || words)
				return space ? '-' : '';
			let code = ch.charCodeAt(0)
			let index = code == 1025 || code == 1105 ? 0 : code > 1071 ? code - 1071 : code - 1039
			let t = [
				'yo', 'a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p',
				'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh', 'shch', '', 'y', '', 'e', 'yu', 'ya'
					]
			return t[index]
		}
	)
