function handleBadRequest(message) {
  return {
    status: 400,
    message
  };
}

function handleNotFound(message) {
  return {
    status: 404,
    message
  };
}

function handleCreated(message, obj) {
  return {
    status: 201,
    message,
    obj
  };
}

module.exports = {
  handleBadRequest,
  handleNotFound,
  handleCreated
};
