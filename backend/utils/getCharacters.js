// Get chatacters from principals characters string
const getCharacters = (characters) => {
  if (!characters) return [];
  try {
    return JSON.parse(characters);
  } catch (e) {
    return [];
  }
};

module.exports = getCharacters;
