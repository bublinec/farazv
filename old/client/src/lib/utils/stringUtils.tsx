export const shorten = (str: string, maxLen = 220, separator = " ") => {
  // return if shorter
  if (str.length <= maxLen) return str;
  let short = str.substring(0, str.lastIndexOf(separator, maxLen));
  // remove one letter word from the end if present
  if (short[short.length - 2] === " ") {
    short = short.substring(0, short.length - 2);
  }
  // remove last word if it is the frist word of a sentence
  const charBeforeLastSpaceIndex = short.lastIndexOf(" ") - 1;
  if (short[charBeforeLastSpaceIndex] === ".") {
    short = short.substring(0, charBeforeLastSpaceIndex + 1);
  } else {
    // if the sentece was cut, add ...
    short += "...";
  }
  return short;
};

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const formatTime = (t: string) => {
  if (!t) {
    return "";
  }
  let timeFormatted = t.slice(0, 5);
  if (timeFormatted[0] === "0") {
    timeFormatted = timeFormatted.slice(1);
  }
  return timeFormatted;
};
