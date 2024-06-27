import { useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';

// import * as L from 'react-leaflet';
// import "leaflet/dist/leaflet.css"



const N2yoWidget2 = ({ norad_id, minelevation_n2yo, width, height }) => {
	// window.onload = initialize;
	useEffect(() => {
		console.log("Initializing N2YO widget")

		initialize();

		if (!isNaN(noradstring)) {
			norad = noradstring;
		}
		else {
			sel = document.createElement("select");
			sel.id = "mySelect";
			var ss = noradstring.split(",");
			for (var i = 0; i < ss.length; i++) {
				var option = document.createElement("option");
				var sss = ss[i].split("|");
				option.value = sss[0];
				option.text = sss[1];
				option.label = sss[1];
				sel.appendChild(option);
				if (i == 0) norad = sss[0];
			}
		}
	}, []);
	var isCentered = false;
	var norad;
	var sel;
	var noradstring = '33591|NOAA 19,28654|NOAA 18,27453|NOAA 17,25338|NOAA 15,25544|ISS,43013|NOAA 20';
	var minelevation = '20';

	var showFootprint = '1';
	var map1;
	var sunOverlay;
	var drawingOverlay;
	var drawingOverlayArray = [];
	var dayNightOverlay;
	var counter = 0;
	var mrk1; var mrk2; var mrk3;
	var step;
	var data;
	var satname;
	var dArray = new Array();
	var tleArray = new Array();
	var altitude;
	var intervalObject;
	var viewer;
	var myip = '';
	var myLat = '';
	var myLng = '';
	var footPrint;

	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


	function initialize() {
		document.getElementById("n2yo_list_label").style.display = "none";

		if (sel != null) {
			document.getElementById("n2yo_list").appendChild(sel);
			document.getElementById("n2yo_list_label").style.display = "block";
			document.getElementById("mySelect").addEventListener("change", function (event) {
				norad = this.value;
				setSatellite(norad);
			});
		}

		document.getElementById("n2yo_satmap1").style.width = "600px";
		document.getElementById("n2yo_satmap1").style.height = "360px";
		document.getElementById("n2yo_timezone").style.width = "600px";
		document.getElementById("n2yo_passes").style.width = "600px";
		document.getElementById("n2yo_passes").style.height = "100px";


		var wd = 600;
		wd = wd - 120;
		//  <div id="n2yo_overmap" style="position:absolute;top:10px;left:40px;z-index:99;font:10px arial;"></div>
		document.getElementById("n2yo_overmap").style.position = "absolute";
		document.getElementById("n2yo_overmap").style.top = "10px";
		document.getElementById("n2yo_overmap").style.left = wd + "px";
		document.getElementById("n2yo_overmap").style.zIndex = "9999";
		document.getElementById("n2yo_overmap").style.font = "12px Arial";

		map1 = L.map('n2yo_satmap1').setView([0, 100], 1);
		map1.setZoom(2);

		var mapStyle1 = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
			attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});

		var mapStyle2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: '',
			maxZoom: 13
		});


		var mapStyle3 = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		});

		var mapStyle4 = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
			maxZoom: 17,
			attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
		});

		var mapStyle5 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Esri'
		});

		mapStyle5.addTo(map1);

		var t = L.terminator();
		t.addTo(map1);
		setInterval(function () { updateTerminator(t) }, 500);

		dayNightSun();

		var dtmp = new Date();
		var tzmin = -dtmp.getTimezoneOffset();
		var tzh = tzmin / 60;
		//alert(tzh);
		let sign = '';
		if (tzh >= 0) sign = "+";
		//else sign = "-";
		document.getElementById("tz").innerHTML = "Local Time: GMT" + sign + tzh;

		axios.get('https://ipapi.co/json')
			.then(function (response) {
				myip = response.data.ip;
				myLat = response.data.latitude;
				myLng = response.data.longitude;
				loadData(norad, start);
				mrk3 = createHomeMarker();
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	function updateTerminator(t) {
		var t2 = L.terminator();
		t.setLatLngs(t2.getLatLngs());
		t.redraw();
	}

	function start(sid) {
		counter = 0;
		intervalObject = setInterval(function () { animateSat(sid); }, 1 * 1000); //every second move the satellite

		//setInterval ("loadData(start)", 5*1000); //every 30 minutes retrieve LEO orbital data
	}

	function loadData(sid, callback) {
		console.log("Loading data for satellite " + sid);
		mrk1 = createSatelliteMarker(sid);
		mrk1.addTo(map1);

		mrk1._icon.style.display = 'none';
		document.getElementById("n2yo_overmap").innerHTML = "Loading...";


		var urls = 'https://api.allorigins.win/raw?url=https://www.n2yo.com/sat/gettle.php?s=' + sid;
		axios.get(urls)
			.then(function (data) {
				if (data != null) {
					tleArray = data.data;

					// Draw orbit path
					let Spos = getCurrentPosition(new Date(), sid);
					let orbitTime = 2 * Math.PI * Math.sqrt(Math.pow(Spos.altitude + 6378.135, 3) / 398600.8);
					console.log("Orbit time: " + orbitTime + " seconds");

					let stepSize = 100;
					step = Math.floor(orbitTime / stepSize * 1.2);
					console.log("Step: " + step);

					let g1Array = [[]];
					let k = 0;
					let oldlng = null;
					let currentDate = new Date();
					for (let i = 0; i < stepSize; i++) {
						let secondsToAdd = -25 * step + i * step;
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

					for (let i = 0; i < 50000; i++) {
						let d = new Date(currentDate.getTime() + i * 5 * 1000); // 5 seconds per iteration
						let pos = getCurrentPosition(d, sid);

						if (pos.elevation > minelevation) {
							let nextPos = getCurrentPosition(new Date(d.getTime() + 5 * 1000), sid);
							// console.log(pos.elevation, nextPos.elevation);
							if (nextPos.elevation > pos.elevation) {
								continue;
							}
							console.log("Next pass at " + d);
							console.log("Elevation: " + pos.elevation);
							console.log(i);
							break;
						}
					}
				}
			});


		// 	// var urlp = '';
		// 	// if (allpasses == '1') urlp = 'https://api.allorigins.win/raw?url=https://www.n2yo.com/sat/allpassesjson.php?s=' + sid + '&me=' + minelevation;
		// 	// else urlp = 'https://api.allorigins.win/raw?url=https://www.n2yo.com/sat/passesjson.php?s=' + sid;



		// 	// jQuery.getJSON(urlp, function (data) {
		// 	// 	if (data != null) {
		// 	// 		showPasses(data);
		// 	// 	}
		// 	// 	else {

		// 	// 	}
		// 	// });
		// 	$("#n2yo_passes").html("No visible upcoming passes");


		// });
		callback(sid);
	}

	function setSatellite(sid) {
		clearInterval(intervalObject);
		//counter = 0;
		document.getElementById("n2yo_passes").innerHTML = '';

		if (drawingOverlayArray.length >= 0) {
			$.each(drawingOverlayArray, function (i, val) {
				map1.removeLayer(drawingOverlayArray[i]);
			});

		}

		if (mrk1 != null) map1.removeLayer(mrk1);
		//if(mrk2 != null) map1.removeLayer(mrk2);
		//dArray = null;
		//document.getElementById("n2yo_satinfo").style.visibility="hidden";
		loadData(sid, start);
	}

	function animateSat(sid) {
		var d = new Date();
		var cPos = getCurrentPosition(d, sid);

		var currPos = new ObjectPosition(sid, new L.latLng(cPos.latitude, cPos.longitude), cPos.altitude, cPos.speed);

		if (currPos != null) {
			//mrk1.setVisible(true);
			//mrk2.setVisible(true);
			if (counter == 0) {
				map1.setView(currPos.latlng);
			}
			mrk1._icon.style.display = 'block';
			mrk1.setLatLng(currPos.latlng);
			/*
			mrk2.setLatLng(currPos.latlng);
			if(!isCentered){
				map1.panTo(mrk1.getLatLng());
				isCentered = true;
			}
			*/
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
				var dir = "";
				if (calt > altitude) dir = "&uarr;";
				else dir = "&darr;";
				altitude = calt;
				var csp = currPos.sp;
				document.getElementById("n2yo_overmap").innerHTML = satname + "<br>LAT: " + round(clat) + "<br>LNG: " + round(clng) + "<br>ALT: " + round(calt) + " " + dir + "<br>SPD: " + round(csp);
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

	function getSpeed(x1, dx, dy, h) {
		// calculate speed, as it is not computed correctly on the server
		var dlat = dx * Math.PI / 180;
		var dlon = dy * Math.PI / 180;
		var lat1 = x1 * Math.PI / 180;
		var lat2 = (x1 + dx) * Math.PI / 180;
		var a = Math.sin(dlat / 2) * Math.sin(dlat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var speed = (h + 6378.135) * c;
		speed = Math.sqrt(398600.8 / (h + 6378.135));
		return speed;
	}

	function createSatelliteMarker(id) {
		var centerWorld = L.latLng(0, 0);
		var icon = L.icon({
			iconUrl: './img/sat.png',
			iconSize: [30, 30], // size of the icon
		});

		var sMarker1 = L.marker(centerWorld, { icon: icon });
		return sMarker1;
	}

	function createHomeMarker() {
		var home = L.latLng(myLat, myLng);

		var icon = L.icon({
			iconUrl: './img/dot.gif',
			iconSize: [7, 7], // size of the icon
		});

		var sMarker1 = L.marker(home, { icon: icon });
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
		<div>
			<script src="./js/leaflet/leaflet.js" type="text/javascript" />
			<script src="./js/leaflet/L.Terminator.js" type="text/javascript" />
			<script src="./js/satellite-js/dist/satellite.min.js" />
			<link rel="stylesheet" href="./js/leaflet/leaflet.css" />
			<div id="n2yo_satmap1">
			</div>
			<div id="n2yo_overmap"></div>
			<div id="n2yo_timezone">
				<span className='float-left'></span>
				<span id="n2yo_list_label">Select: </span><span
					id="n2yo_list"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<span className='float-right' id="tz"></span>
			</div>
			<div id="n2yo_passes"></div>
			<span id="n2yo_info_title"></span>
		</div>
	)
};


export default N2yoWidget2;
