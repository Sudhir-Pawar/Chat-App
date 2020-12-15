const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (username === "" || room === "")
    return { error: "username and room must be provided" };

  if (users.find((user) => user.room === room && user.username === username))
    return { error: "username already exists" };

  users.push({ id, username, room });
  return { user: users[users.length - 1] };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index >= 0) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
