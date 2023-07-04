const capitalise = (str) => {
  // Remove underscores and replace with spaces
  str = str.replace(/_/g, " ");
  // Capitalise first letter of each word
  str = str.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
  return str;
};

export default capitalise;
