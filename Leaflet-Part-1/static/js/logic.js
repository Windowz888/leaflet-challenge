// Defining tile layer
let strs = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});

// Initializing map with default props
let mp = L.map('map', {
    center: [20, 0],
    zoom: 2,
    layers: [strs]
});

// Fetch earthquake data and add to map
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(dt => {
    console.log(dt);
    let uDep = [...new Set(dt.features.map(f => f.geometry.coordinates[2]))];
    console.log("Unique Depths:", uDep.sort((a, b) => a - b));

    L.geoJSON(dt, {
        pointToLayer: function (ft, ll) {
            let opts = {
                radius: gRad(ft.properties.mag),
                fillColor: gCol(ft.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circleMarker(ll, opts);
        },
        onEachFeature: function (ft, lr) {
            lr.bindPopup(`<h3>Magnitude: ${ft.properties.mag}</h3><hr><h3>Location: ${ft.properties.place}</h3>`);
        }
    }).addTo(mp);

    // Legend for depth
    let dLeg = L.control({ position: 'bottomright' });
    dLeg.onAdd = function (mp) {
        let dv = L.DomUtil.create('div', 'info legend'),
            grds = [0, 10, 20, 30, 50, 70, 100, 150, 250, 400];
        dv.innerHTML += "<strong>Depth</strong><br>";
        for (let i = 0; i < grds.length; i++) {
            dv.innerHTML +=
                '<i style="background:' + gCol(grds[i] + 1) + '"></i> ' +
                grds[i] + (grds[i + 1] ? '&ndash;' + grds[i + 1] + ' ' : '+') +
                '<span style="background-color: ' + gCol(grds[i] + 1) + ';">&nbsp;&nbsp;&nbsp;&nbsp;</span><br>';
        }
        return dv;
    };
    dLeg.addTo(mp);

    // Legend for magnitude
    let mLeg = L.control({ position: 'bottomleft' });
    mLeg.onAdd = function (mp) {
        let dv = L.DomUtil.create('div', 'info legend'),
            mags = [4.5, 5.0, 5.5, 6.0];
        dv.innerHTML += "<strong>Magnitude</strong><br>";
        for (let i = 0; i < mags.length; i++) {
            dv.innerHTML +=
                '<i style="width: ' + gRad(mags[i]) * 2 + 'px; height: ' + gRad(mags[i]) * 2 + 'px; background-color: #999; border-radius: 50%; display: inline-block;"></i> ' +
                `~${mags[i]}<br>`;
        }
        return dv;
    };
    mLeg.addTo(mp);
});

function gRad(mag) {
    return Math.pow(mag, 2);
}

function gCol(dpth) {
    return dpth > 400 ? '#004d00' :
           dpth > 300 ? '#006600' :
           dpth > 250 ? '#008000' :
           dpth > 150 ? '#009900' :
           dpth > 100 ? '#00b300' :
           dpth > 70  ? '#00cc00' :
           dpth > 50  ? '#00e600' :
           dpth > 30  ? '#1aff1a' :
           dpth > 20  ? '#4dff4d' :
           dpth > 10  ? '#80ff80' :
                        '#b3ffb3';
}

