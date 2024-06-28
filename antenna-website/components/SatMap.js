import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EmojiComponent from './EmojiComponent';

var map1;
var intervalObject;
var minelevation = '5';
var showFootprint = '1';
var sunOverlay;
var drawingOverlayArray = [];
var counter = 0;
var mrk1;
var step;
var tleArray = new Array();
var footPrint;
var myLat;
var myLng;

const SatMap = ({ lat, lng, norad_id, satname, setAzimuth, setElevation }, ref) => {
	const [oldNoradId, setOldNoradId] = useState(norad_id);
	const [passTable, setPassTable] = useState(null);

	useEffect(() => {
		console.log("Initializing Map")
		initialize();
	}, []);

	useEffect(() => {
		if (norad_id == oldNoradId) {
			console.log("Norad ID did not change, returning")
			return;
		}
		setOldNoradId(norad_id);

		console.log("Norad ID changed to: " + norad_id);
		setSatellite(norad_id);
	}, [norad_id]);

	function initialize() {
		var wd = 600;
		wd = wd - 120;

		map1 = L.map('satmap1').setView([0, 100], 1);
		map1.setZoom(2);

		var mapStyle1 = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
			attribution: ''
		});

		var mapStyle2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: '',
			maxZoom: 13
		});

		var mapStyle3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: ''
		});

		var mapStyle4 = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution: ''
		});

		var mapStyle5 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: ''
		});

		mapStyle5.addTo(map1);

		var t = L.terminator();
		t.addTo(map1);
		setInterval(function () { updateTerminator(t) }, 500);

		dayNightSun();
		myLat = lat;
		myLng = lng;

		loadData(norad_id, start);
		createHomeMarker();
	}

	function updateTerminator(t) {
		var t2 = L.terminator();
		t.setLatLngs(t2.getLatLngs());
		t.redraw();
	}

	function start(sid) {
		counter = 0;
		intervalObject = setInterval(function () { animateSat(sid); }, 1 * 1000); //every second move the satellite
	}

	const formatDate = (date, onlyTime = false) => {
		let options;
		if (onlyTime) {
			const hours = date.getHours().toString().padStart(2, '0'); // Get hours (in 24-hour format) and pad with leading zero if necessary
			const minutes = date.getMinutes().toString().padStart(2, '0'); // Get minutes and pad with leading zero if necessary
			return `${hours}:${minutes}`;

		} else {
			options = {
				month: 'short', // Short month name (e.g., Jan, Feb, etc.)
				day: 'numeric', // Day of the month (1 through 31)
				hour12: false,  // Use 24-hour time format
				hour: 'numeric', // Hours (0 through 23)
				minute: '2-digit' // Minutes (00 through 59)
			};
		}
		return `${date.toLocaleDateString('en-US', options)}`;
	};

	const azimuthToCompass = (azimuth) => {
		if (azimuth >= 0 && azimuth < 22.5) return 'N';
		if (azimuth >= 22.5 && azimuth < 67.5) return 'NE';
		if (azimuth >= 67.5 && azimuth < 112.5) return 'E';
		if (azimuth >= 112.5 && azimuth < 157.5) return 'SE';
		if (azimuth >= 157.5 && azimuth < 202.5) return 'S';
		if (azimuth >= 202.5 && azimuth < 247.5) return 'SW';
		if (azimuth >= 247.5 && azimuth < 292.5) return 'W';
		if (azimuth >= 292.5 && azimuth < 337.5) return 'NW';
		if (azimuth >= 337.5) return 'N';
	};

	function loadData(sid, callback) {
		if (map1 == null) {
			alert("Map not initialized");
			return;
		}

		console.log("Loading data for satellite " + sid);
		mrk1 = createSatelliteMarker(sid);
		mrk1.addTo(map1);

		mrk1._icon.style.display = 'none';

		var urls = 'https://api.allorigins.win/raw?url=https://www.n2yo.com/sat/gettle.php?s=' + sid;
		axios.get(urls)
			.then(function (data) {
				if (data != null) {
					tleArray = data.data;

					// Draw orbit path
					let Spos = getCurrentPosition(new Date(), sid);
					let orbitTime = 2 * Math.PI * Math.sqrt(Math.pow(Spos.altitude + 6378.135, 3) / 398600.8);
					console.log("Orbit time: " + orbitTime + " seconds");

					let stepSize = 500;
					step = Math.floor(orbitTime / stepSize * 1.2);
					console.log("Step: " + step);

					let g1Array = [[]];
					let k = 0;
					let oldlng = null;
					let currentDate = new Date();
					for (let i = 0; i < stepSize; i++) {
						// Go 25 percent back and 75 percent forward
						let secondsToAdd = -(stepSize / 4) * step + i * step;
						let d = new Date(currentDate.getTime() + secondsToAdd * 1000);
						let pos = getCurrentPosition(d, sid);

						if (Math.abs(pos.longitude - oldlng) > 90 && oldlng != null) {
							k = k + 1;
							g1Array[k] = [];
						}
						oldlng = pos.longitude;

						g1Array[k].push([pos.latitude, pos.longitude]);
					}

					for (let i = 0; i < g1Array.length; i++) {
						drawingOverlayArray.push(L.polyline(g1Array[i], { color: 'red', weight: 2, opacity: 0.5 }).addTo(map1));
					}

					// Find next pass
					console.log("My lat: " + myLat + " My lng: " + myLng)

					let startDate = new Date();
					let highestElevationDate = new Date();
					let endDate = new Date();
					let lockStartDate = false;

					for (let i = 0; i < 50000; i++) {
						let d = new Date(currentDate.getTime() + i * 5 * 1000); // 5 seconds per iteration
						let pos = getCurrentPosition(d, sid);

						if (pos.elevation > minelevation) {
							let nextPos = getCurrentPosition(new Date(d.getTime() + 5 * 1000), sid);
							// console.log(pos.elevation, nextPos.elevation);
							if (nextPos.elevation > pos.elevation) {
								if (!lockStartDate) {
									startDate = d;
									console.log("Start date: " + d);
									lockStartDate = true;
								}
								continue;
							}
							highestElevationDate = d;

							console.log("Next pass at " + d);
							console.log("Elevation: " + pos.elevation);
							// find end date
							for (let j = i; j < 50000; j++) {
								let d2 = new Date(currentDate.getTime() + j * 5 * 1000); // 5 seconds per iteration
								let pos2 = getCurrentPosition(d2, sid);
								if (pos2.elevation < minelevation) {
									endDate = d2;
									console.log("End date: " + d2);
									break;
								}
							}
							break;
						}
					}

					let startAzimuth = Math.round(getCurrentPosition(startDate, sid).azimuth);
					let endAzimuth = Math.round(getCurrentPosition(endDate, sid).azimuth);

					setPassTable(
						<tr className="text-center">
							<td className="border-border border-2 p-2"><EmojiComponent text={`📅${formatDate(startDate)}, 🧭${startAzimuth}° ${azimuthToCompass(startAzimuth)}`} /></td>
							<td className="border-border border-2 p-2" ><EmojiComponent text={`🕒${formatDate(highestElevationDate, true)}, 🔭${Math.round(getCurrentPosition(highestElevationDate, sid).elevation)}°`} /></td>
							<td className="border-border border-2 p-2"><EmojiComponent text={`🕒${formatDate(endDate, true)}, 🧭${endAzimuth}° ${azimuthToCompass(endAzimuth)}`} /></td>
						</tr>
					);
				}
			});

		callback(sid);
	}

	function setSatellite(sid) {
		console.log(sid);
		clearInterval(intervalObject);
		if (drawingOverlayArray.length >= 0) {
			drawingOverlayArray.forEach((val) => {
				map1.removeLayer(val);
			});
		}

		if (mrk1 != null) map1.removeLayer(mrk1);
		loadData(sid, start);
	}

	function animateSat(sid) {
		var d = new Date();
		var cPos = getCurrentPosition(d, sid);
		setAzimuth(cPos.azimuth);
		setElevation(cPos.elevation);

		var currPos = new ObjectPosition(sid, new L.latLng(cPos.latitude, cPos.longitude), cPos.altitude, cPos.speed);

		if (currPos != null) {
			if (counter == 0) {
				map1.setView(currPos.latlng);
			}
			mrk1._icon.style.display = 'block';
			mrk1.setLatLng(currPos.latlng);

			var footPrintOld;
			if (footPrint != null) {
				footPrintOld = footPrint;
				map1.removeLayer(footPrintOld);
			}
			var vz = currPos.alt;
			var tangent = Math.sqrt(vz * (vz + 2 * 6375));
			var centerAngle = Math.asin(tangent / (6375 + vz));
			var footPrintRadius = 6375 * centerAngle; //km

			if (showFootprint == '1') {
				footPrint = L.circle(currPos.latlng, {
					color: '#A80000',
					fillColor: '#FFA6A6',
					fillOpacity: 0.4,
					opacity: 0.7,
					weight: 1,
					radius: footPrintRadius * 1000
				}).addTo(map1);
			}

			if (currPos != null) {
				var clat = (currPos.latlng).lat;
				var clng = (currPos.latlng).lng;
				var calt = currPos.alt;

				var csp = currPos.sp;
				if (document.getElementById("lat") == null) return;
				document.getElementById("lat").innerHTML = round(clat);
				document.getElementById("long").innerHTML = round(clng);
				document.getElementById("alt").innerHTML = Math.floor(calt) + "km";
				document.getElementById("speed").innerHTML = round(csp) + "km/s";
				document.getElementById("az").innerHTML = round(cPos.azimuth) + "°";
				document.getElementById("el").innerHTML = round(cPos.elevation) + "°";

			}
			counter++;
		}
		if (counter % 60 == 0) dayNightSun();

	}

	function getCurrentPosition(now, s) {
		// NOTE: while Javascript Date returns months in range 0-11, all satellite.js methods require
		// months in range 1-12.
		var x1 = tleArray[0];
		var x2 = tleArray[1];

		var satrec = satellite.twoline2satrec(x1, x2);
		var positionAndVelocity = satellite.propagate(
			satrec,
			now.getUTCFullYear(),
			now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
			now.getUTCDate(),
			now.getUTCHours(),
			now.getUTCMinutes(),
			now.getUTCSeconds()
		);

		// The position_velocity result is a key-value pair of ECI coordinates.
		// These are the base results from which all other coordinates are derived.
		var positionEci = positionAndVelocity.position,
			velocityEci = positionAndVelocity.velocity;


		var gmst = satellite.gstimeFromDate(
			now.getUTCFullYear(),
			now.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
			now.getUTCDate(),
			now.getUTCHours(),
			now.getUTCMinutes(),
			now.getUTCSeconds()
		);

		var deg2rad = Math.PI / 180;

		var observerGd = {
			longitude: myLng * deg2rad,
			latitude: myLat * deg2rad,
			height: 0
		};

		// You can get ECF, Geodetic, Look Angles, and Doppler Factor.
		var positionEcf = satellite.eciToEcf(positionEci, gmst),
			positionGd = satellite.eciToGeodetic(positionEci, gmst),
			dopplerFactor = 0;
		var lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
		var dopplerFactor = 0;
		var azimuth1 = lookAngles.azimuth;
		var elevation1 = lookAngles.elevation;
		var azimuth = azimuth1 * 180 / Math.PI;
		var elevation = elevation1 * 180 / Math.PI;

		var satelliteX = positionEci.x,
			satelliteY = positionEci.y,
			satelliteZ = positionEci.z;

		// Geodetic coords are accessed via `longitude`, `latitude`, `height`.
		var longitude = positionGd.longitude,
			latitude = positionGd.latitude,
			height = positionGd.height;

		//  Convert the RADIANS to DEGREES for pretty printing (appends "N", "S", "E", "W". etc).
		var longitudeStr = satellite.degreesLong(longitude),
			latitudeStr = satellite.degreesLat(latitude);

		var velocity = Math.sqrt(398600.8 / (height + 6378.135));
		//console.log(longitudeStr + ' ' + latitudeStr);

		return { longitude: longitudeStr, latitude: latitudeStr, altitude: height, speed: velocity, azimuth: azimuth, elevation: elevation };
	}

	// function getSpeed(x1, dx, dy, h) {
	// 	// calculate speed, as it is not computed correctly on the server
	// 	var dlat = dx * Math.PI / 180;
	// 	var dlon = dy * Math.PI / 180;
	// 	var lat1 = x1 * Math.PI / 180;
	// 	var lat2 = (x1 + dx) * Math.PI / 180;
	// 	var a = Math.sin(dlat / 2) * Math.sin(dlat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
	// 	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	// 	var speed = (h + 6378.135) * c;
	// 	speed = Math.sqrt(398600.8 / (h + 6378.135));
	// 	return speed;
	// }

	function createSatelliteMarker(id) {
		let centerWorld = L.latLng(0, 0);
		let icon = L.icon({
			iconUrl: './img/sat.png',
			iconSize: [30, 30], // size of the icon
		});

		return L.marker(centerWorld, { icon: icon });
	}

	function createHomeMarker() {
		let home = L.latLng(myLat, myLng);

		let icon = L.icon({
			iconUrl: './img/dot.gif',
			iconSize: [7, 7], // size of the icon
		});

		let sMarker1 = L.marker(home, { icon: icon });
		sMarker1.addTo(map1);

		return sMarker1;
	}

	function dayNightSun() {
		if (sunOverlay != null) {
			map1.removeLayer(sunOverlay);
		}
		sunOverlay = getSunOverlay();
		sunOverlay.addTo(map1);
	}

	function getSunOverlay() {
		var j = jd();
		var dec = sunDecRA(1, j);
		var dt = new Date();
		var LT = dt.getUTCHours() + dt.getUTCMinutes() / 60;
		let DY = dayofyear(dt);
		let g = (360 / 365.25) * (DY + LT / 24);
		let TC = 0.004297 + 0.107029 * Math.cos(g * Math.PI / 180) - 1.837877 * Math.sin(g * Math.PI / 180) - 0.837378 * Math.cos(2 * g * Math.PI / 180) - 2.340475 * Math.sin(2 * g * Math.PI / 180);
		let SHA = (LT - 12) * 15 + TC;
		var icon = L.icon({
			iconUrl: './img/sun.gif',
			iconSize: [16, 16], // size of the icon
			iconAnchor: [3, 3], // point of the icon which will correspond to marker's location
		});

		var sunMarker = L.marker([dec, -SHA], { icon: icon });
		return sunMarker;
	}

	function dayofyear(d) {   // d is a Date object
		var yn = d.getFullYear();
		var mn = d.getMonth();
		var dn = d.getDate();
		var d1 = new Date(yn, 0, 1, 12, 0, 0); // noon on Jan. 1
		var d2 = new Date(yn, mn, dn, 12, 0, 0); // noon on input date
		var ddiff = Math.round((d2 - d1) / 864e5);
		return ddiff + 1;
	}

	function sunDecRA(what, jd) {
		var PI2 = 2.0 * Math.PI;
		var cos_eps = 0.917482;
		var sin_eps = 0.397778;
		var M, DL, L, SL, X, Y, Z, R;
		var T, dec, ra;
		T = (jd - 2451545.0) / 36525.0;	// number of Julian centuries since Jan 1, 2000, 0 GMT								
		M = PI2 * frac(0.993133 + 99.997361 * T);
		DL = 6893.0 * Math.sin(M) + 72.0 * Math.sin(2.0 * M);
		L = PI2 * frac(0.7859453 + M / PI2 + (6191.2 * T + DL) / 1296000);
		SL = Math.sin(L);
		X = Math.cos(L);
		Y = cos_eps * SL;
		Z = sin_eps * SL;
		R = Math.sqrt(1.0 - Z * Z);
		dec = (360.0 / PI2) * Math.atan(Z / R);
		ra = (48.0 / PI2) * Math.atan(Y / (X + R));
		if (ra < 0) ra = ra + 24.0;
		if (what == 1) return dec; else return ra;
	}

	function frac(X) {
		X = X - Math.floor(X);
		if (X < 0) X = X + 1.0;
		return X;
	}

	function round(num) {
		var prefix = "";
		var suffix = "";
		if (num < 0) {
			prefix = "-";
			suffix = "";
			num = - num;
		}
		var temp = Math.round(num * 100.0); // convert to pennies! 
		if (temp < 10) return prefix + "0.0" + temp + suffix;
		if (temp < 100) return prefix + "0." + temp + suffix;
		temp = prefix + temp; // convert to string! 
		return temp.substring(0, temp.length - 2) + "." + temp.substring(temp.length - 2) + suffix;
	}

	function jd() {
		var dt = new Date();
		let MM = dt.getMonth() + 1;
		let DD = dt.getDate();
		let YY = dt.getFullYear();
		let HR = dt.getUTCHours();
		let MN = dt.getUTCMinutes();
		let SC = 0;

		HR = HR + (MN / 60) + (SC / 3600);
		let GGG = 1;
		if (YY <= 1585) GGG = 0;
		let JD = -1 * Math.floor(7 * (Math.floor((MM + 9) / 12) + YY) / 4);
		let S = 1;
		if ((MM - 9) < 0) S = -1;
		let A = Math.abs(MM - 9);
		let J1 = Math.floor(YY + S * Math.floor(A / 7));
		J1 = -1 * Math.floor((Math.floor(J1 / 100) + 1) * 3 / 4);
		JD = JD + Math.floor(275 * MM / 9) + DD + (GGG * J1);
		JD = JD + 1721027 + 2 * GGG + 367 * YY - 0.5;
		JD = JD + (HR / 24);
		return JD;
	}

	function ObjectPosition(a, b, c, d) {
		this.id = a;
		this.latlng = b;
		this.alt = c; // km
		this.sp = d; // m/s
	}

	return (
		<div className=''>
			<div id="satmap1" className='w-[600px] h-[360px] z-0' />
			<div className='w-[600px] bg-primary bg-opacity-80 h-12 -translate-y-12 flex justify-between items-center pr-4'>
				<div className='grid grid-cols-2 text-sm ml-2'>
					<div>
						<EmojiComponent text="🌐 Latitude: " />
						<span id='lat'></span>
					</div>
					<div>
						<EmojiComponent text="🌐 Longitude: " />
						<span id='long'></span>
					</div>
					<div>
						<EmojiComponent text="↕️ Height: " />
						<span id='alt'></span>
					</div>
					<div>
						<EmojiComponent text="🚀 Speed: " />
						<span id='speed'></span>
					</div>
				</div>
				<div>
					<span className='text-2xl'>{satname}</span>
				</div>
				<div className='flex flex-col text-md'>
					<span><EmojiComponent text="🧭 Azimuth: " /><span id='az'></span></span>
					<span><EmojiComponent text="🔭 Elevation: " /><span id='el'></span></span>
				</div>
			</div>
			<div className="overflow-x-auto w-[600px] -mt-12">
				<table className="table-auto  w-full bg-secondarybackground border-border border-2">
					<thead>
						<tr className="">
							<th className="border-border border-2 p-2"><EmojiComponent text="🧭 Start Azimuth" /></th>
							<th className="border-border border-2 p-2"><EmojiComponent text="🔭 Max Elevation" /></th>
							<th className="border-border border-2 p-2"><EmojiComponent text="🧭 End Azimuth" /></th>
						</tr>
					</thead>
					<tbody>
						{passTable}
					</tbody>
				</table>
			</div>
		</div>
	)
};


export default SatMap;
