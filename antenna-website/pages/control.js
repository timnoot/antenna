import N2YOwidget from "../components/N2YOwidget";
import { useEffect } from 'react';

const SATELLITES = [
    { "name": "NOAA 19", "norad_id": 33591 },
    { "name": "NOAA 18", "norad_id": 28654 },
    { "name": "NOAA 17", "norad_id": 27453 },
    { "name": "NOAA 15", "norad_id": 25338 },
    { "name": "ISS", "norad_id": 25544 },
    { "name": "NOAA 20", "norad_id": 43013 },
]


export default function Control() {
    const norard_id_string = SATELLITES.map(s => `${s.norad_id}|${s.name}`).join(',');

    return (
        <div className='grid-cols-3 text-center'>
            <h1 className='text-4xl my-8'>Control Page</h1>
            <select className='m-4 bg-primary' onChange={(e) => {
                console.log(e.target.value);
                // execute code in console
                // window.eval('const mySelect = document.getElementById("n2yo_iframe");console.log(mySelect);')
                const n2yo_iframe = document.getElementById('n2yo_iframe');
                // change the src of the iframe
                n2yo_iframe.src = `https://www.n2yo.com/widgets/widget-tracker.php?s=${e.target.value}&size=medium&all=1&me=5&map=5&foot=1`;


            }}>
                {SATELLITES.map(s => <option key={s.norad_id} value={s.norad_id}>{s.name}</option>)}
            </select>

            <div className='bg-white w-min m-4'>
                <N2YOwidget norad_id={norard_id_string} width='600' height='463' />
            </div>
        </div>
    );
}


