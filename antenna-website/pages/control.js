import SatMap from "../components/SatMap";
import { useEffect, useRef, useState } from 'react';

const SATELLITES = [
    { "name": "NOAA 19", "norad_id": 33591 },
    { "name": "NOAA 18", "norad_id": 28654 },
    { "name": "NOAA 17", "norad_id": 27453 },
    { "name": "NOAA 15", "norad_id": 25338 },
    { "name": "ISS", "norad_id": 25544 },
    { "name": "NOAA 20", "norad_id": 43013 },
]


export default function Control() {
    const [norad_id, setNorad_id] = useState(33591);
    const [satname, setSatname] = useState('NOAA 19');
    const [azimuth, setAzimuth] = useState(0);
    const [elevation, setElevation] = useState(0);

    return (
        <div className='flex flex-col items-center'>
            <h1 className='text-4xl mt-8'>Control Page</h1>
            <div className='flex w-full justify-between'>
                <div className='flex flex-col items-center w-[600px] min-w-[300px] ml-6'>
                    <select className=' bg-secondary border-2 border-border hover:brightness-125 text-3xl rounded-xl' onChange={(e) => {
                        setNorad_id(e.target.value);
                        setSatname(SATELLITES.find(s => s.norad_id === parseInt(e.target.value)).name);
                    }}>
                        {SATELLITES.map(s => <option key={s.norad_id} value={s.norad_id}>{s.name}</option>)}
                    </select>

                    <div className='w-full m-4'>
                        <SatMap norad_id={norad_id} satname={satname} setAzimuth={setAzimuth} setElevation={setElevation} />
                    </div>
                </div>

                <div className='flex flex-col items-center space-y-4'>
                    <
                </div>
            </div>
        </div>
    );
}

