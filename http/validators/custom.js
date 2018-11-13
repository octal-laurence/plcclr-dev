exports.isDate = input => {
  if (input && (new Date(input) === 'Invalid Date')) {
    return false;
  }
  return true;
}

exports.isInteger = input => {
  if (input && (typeof input) !== 'number') {
    return false;
  }
  return true;
}

exports.isString = input => {
  if (input && (typeof input) !== 'string') {
    return false;
  }
  return true;
}