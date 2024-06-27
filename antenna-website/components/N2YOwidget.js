// components/N2yoWidget.js
import { useEffect } from 'react';

const N2yoWidget = ({ norad_id, minelevation_n2yo, width, height }) => {
	useEffect(() => {
		function makeid() {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			for (var i = 0; i < 5; i++)
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			return text;
		}

		var rndid = makeid();
		var hostname = "https://www.n2yo.com";

		var footprint_n2yo = '1';
		var allpasses_n2yo = '1';
		var map_n2yo = '5';

		if (typeof minelevation_n2yo == 'undefined') {
			var minelevation_n2yo = '5';
		}

		var widgetContainer = document.getElementById('widgetContainer');
		widgetContainer.innerHTML = `<div id="${rndid}"></div>`;

		var newIframe = document.createElement('iframe');

		newIframe.width = width || '610';
		newIframe.height = height || '510';

		newIframe.style.border = 'none';
		newIframe.style.overflow = 'hidden';
		newIframe.src = 'about:blank';
		newIframe.scrolling = 'no';
		newIframe.id = 'n2yo_iframe';

		document.getElementById(rndid).appendChild(newIframe);
		console.log(norad_id);
		// const script = newIframe.contentWindow.document.createElement('script');
		// repeat hello every 1 seconds
		// script.innerHTML = `setInterval(() => { console.log('hello'); }, 1000);`;

		newIframe.src = `${hostname}/widgets/widget-tracker.php?s=${norad_id || '25657'}&size=medium&all=${allpasses_n2yo}&me=${minelevation_n2yo}&map=${map_n2yo}&foot=${footprint_n2yo}`;
		console.log(newIframe.document);

		// newIframe.contentWindow.document.head.appendChild(script);
		// // read the iframe content every 1 seconds
		// setInterval(() => {
		// 	console.log(newIframe.contentWindow.document.head);
		// }, 1000);



	}, []);

	return (
		<div id="widgetContainer"></div>
	);
};

export default N2yoWidget;
