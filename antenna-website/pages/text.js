
import { useEffect } from "react";

export default function test() {
    useEffect(() => {
        // Initialize the map with worldCopyJump enabled
        var map = L.map('map', {
            center: [0, 0],
            zoom: 2,
            worldCopyJump: true
        });

        // Add a tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Function to add a marker and its infinite copies
        function addInfiniteMarker(lat, lng) {
            var marker = L.marker([lat, lng]).addTo(map);

            var wrapMarker = function () {
                var bounds = map.getBounds();
                var west = bounds.getWest();
                var east = bounds.getEast();
                
                // Clear existing markers if they exist
                marker._wrapMarkers = marker._wrapMarkers || [];
                marker._wrapMarkers.forEach(function (m) { map.removeLayer(m); });
                marker._wrapMarkers = [];

                // Add wrapped markers
                for (var i = Math.floor(west / 360) - 1; i <= Math.ceil(east / 360) + 1; i++) {
                    if (i !== 0) {
                        var wrappedLng = lng + i * 360;
                        var wrappedMarker = L.marker([lat, wrappedLng]).addTo(map);
                        marker._wrapMarkers.push(wrappedMarker);
                    }
                }
            };

            // Initial call to wrapMarker
            wrapMarker();

            // Update wrapped markers on moveend event
            map.on('moveend', wrapMarker);
        }

        // Add infinite markers
        addInfiniteMarker(0, 0);
        addInfiniteMarker(10, 10);
        addInfiniteMarker(-10, -10);
    }, []);



    return (
        <div id="map" className='h-[600px]'></div>


    );
}



