const socket = io({ transports: ["websocket"], upgrade: false });

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messageContainer = document.querySelector("#message-container");
const $chatSidebar = document.querySelector(".chat__sidebar");

const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

mapboxgl.accessToken =
  "pk.eyJ1Ijoic3VkaGlyLXBhd2FyIiwiYSI6ImNraXE5dXB2dzF1ZnQydnFqOGk0bWRkOWMifQ.CRXPEfe6cyizxx5UAYWFyA";

const autoScroll = () => {
  const $newMessage = $messageContainer.lastElementChild;

  const newMessageMargin = parseInt(getComputedStyle($newMessage).marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messageContainer.offsetHeight;
  const containerHeight = $messageContainer.scrollHeight;

  const scrollOffset = $messageContainer.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageContainer.scrollTop = $messageContainer.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  $messageContainer.insertAdjacentHTML(
    "beforeend",
    Mustache.render($messageTemplate, {
      username: message.username,
      message: message.text,
      createdAt: moment(message.createdAt).format("h:mm A"),
    })
  );
  autoScroll();
});

socket.on("locationMessage", (location) => {
  $messageContainer.insertAdjacentHTML(
    "beforeend",
    Mustache.render($locationMessageTemplate, {
      username: location.username,
      locationURL: location.url,
      createdAt: moment(location.createdAt).format("h:mm A"),
      timestamp: location.createdAt,
    })
  );
  const coords = [location.coords.longitude, location.coords.latitude];
  const map = new mapboxgl.Map({
    container: `map-${location.username}-${location.createdAt}`,
    style: "mapbox://styles/mapbox/streets-v11",
    center: coords,
    zoom: 14,
    interactive: false,
  });
  new mapboxgl.Marker().setLngLat(coords).addTo(map);

  document
    .querySelector(`#map-${location.username}-${location.createdAt}`)
    .addEventListener("click", (e) => {
      console.log(
        document
          .querySelector(".location-map-container")
          .getAttribute("data-location-url")
      );
      window.open(
        document
          .querySelector(".location-map-container")
          .getAttribute("data-location-url")
      );
    });
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  console.log(room);
  console.log(users);
  $chatSidebar.innerHTML = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
});
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", e.target.elements.message.value, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) return console.log(error);
    console.log("Message was delivered");
  });
});

$sendLocationButton.addEventListener("click", (e) => {
  const geolocation = navigator.geolocation;
  if (!geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("sendLocation", { latitude, longitude }, () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location was shared");
      });
    },
    (error) => {
      console.log(error);
    },
    { enableHighAccuracy: true }
  );
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
