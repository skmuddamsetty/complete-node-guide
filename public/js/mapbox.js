/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
mapboxgl.accessToken =
  'pk.eyJ1IjoibG9naWNhbGJyYWlucy1mdWxsc3RhY2siLCJhIjoiY2s5c2V1ZTNyMTRpYjN0cXgyY2N3eTZ3YyJ9.aEMhb55AuDQYjMrFCc637Q';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/logicalbrains-fullstack/ck9sffy3h0cl51iqeqon6rx8s',
  scrollZoom: false,
  //   center: [-118.113491, 34.111745],
  //   zoom: 10,
  //   interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach((location) => {
  // Create marker on the map
  const el = document.createElement('div');
  // Add Marker
  el.className = 'marker';
  new mapboxgl.Marker({ element: el, anchor: 'bottom' })
    .setLngLat(location.coordinates)
    .addTo(map);
  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day: ${location.day}: ${location.description}</p>`)
    .addTo(map);
  // Extend the map bounds to include the current location
  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
