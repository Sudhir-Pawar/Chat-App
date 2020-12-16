const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};
const generateLocationMessage = (username, coords, url) => {
  return {
    username,
    coords,
    url,
    createdAt: new Date().getTime(),
  };
};
module.exports = {
  generateMessage,
  generateLocationMessage,
};
