const fs = require('fs');
const path = require('path');

const stopsPath = path.join(__dirname, 'api', 'stops.json');
const stops = JSON.parse(fs.readFileSync(stopsPath, 'utf8'));

const fixedStops = stops.map(stop => {
  // Swap lat and lng because they were reversed in the source
  // Yangon is around lat: 16.8, lng: 96.1
  const oldLat = stop.lat;
  const oldLng = stop.lng;
  
  return {
    ...stop,
    lat: oldLng,
    lng: oldLat
  };
});

fs.writeFileSync(stopsPath, JSON.stringify(fixedStops, null, 2));
console.log('Fixed stops.json coordinates.');
