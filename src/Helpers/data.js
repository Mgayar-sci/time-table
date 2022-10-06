const convert2ArraysToDict = (a, b) => {
  return a.reduce((d, x, i) => {
    if (!b[i]) return d;
    d[x] = b[i];
    return d;
  }, {});
};

export { convert2ArraysToDict };
