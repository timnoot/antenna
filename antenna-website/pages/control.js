import SatMap from "../components/SatMap";
import { useEffect, useRef, useState } from 'react';
import ArduinoControl from "../components/ArduinoControl";
import Footer from "../components/Footer";
import { NextRequest } from 'next/server'
import axios from "axios";


const SATELLITES = [
    { "name": "NOAA 19", "norad_id": 33591, "freq": '137.100 MHz' },
    { "name": "NOAA 18", "norad_id": 28654, "freq": '137.9125 MHz' },
    { "name": "Meteor M2-4", "norad_id": 59051, "freq": '137.100-137.900 MHz' },
    { "name": "Meteor M2-3", "norad_id": 57166, "freq": '137.100-137.900 MHz' },
    { "name": "Meteor M2-2", "norad_id": 44387, "freq": '137.100-137.900 MHz' },
    { "name": "Meteor M2", "norad_id": 40069, "freq": '137.100-137.900 MHz' },

    { "name": "ISS", "norad_id": 25544, "freq": '145.825 MHz' },
    { "name": "Sim. NOAA 19", "norad_id": 33591, "freq": '137.100 MHz', simulated: true },
]


export default function Control({ lat, lng }) {
    const [norad_id, setNorad_id] = useState(33591);
    const [satname, setSatname] = useState('NOAA 19');
    const [freq, setFreq] = useState('137.100 MHz');
    const [simulationStartDate, setSimulationStartDate] = useState(null);

    const [azimuth, setAzimuth] = useState(0);
    const [elevation, setElevation] = useState(0);

    return (
        <>
            <div className='flex flex-col items-center'>
                <h1 className='text-4xl mt-8'>Control Page</h1>
                <div className='flex w-full justify-between'>
                    <div className='flex flex-col items-center w-[600px] 3xl:w-[900px] min-w-[300px] ml-2 xl:ml-16'>
                        <div className="flex justify-between items-center w-full">
                            <div className="flex-grow">
                                <div className="select-wrapper w-min">
                                    <select className="bg-secondary pr-8 border-2 border-border hover:brightness-125 text-3xl rounded-xl px-2 transition duration-300 ease-in-out cursor-pointer" onChange={(e) => {
                                        setNorad_id(SATELLITES.find(s => s.name === e.target.value).norad_id);
                                        setSatname(e.target.value);
                                        setFreq(SATELLITES.find(s => s.name === e.target.value).freq);
                                        setSimulationStartDate(SATELLITES.find(s => s.name === e.target.value).simulated ? new Date() : null);
                                    }}>
                                        {SATELLITES.map(s => <option key={s.norad_id + s.name} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <p className="text-xl 3xl:text-3xl">Frequency: {freq}</p>
                        </div>
                        <div className='w-full m-4'>
                            <SatMap lat={lat} lng={lng} norad_id={norad_id} satname={satname} setAzimuth={setAzimuth} setElevation={setElevation} simulationStartDate={simulationStartDate} />
                        </div>
                    </div>
                    <div className='items-center w-[calc(100vw-650px)]'>
                        <ArduinoControl azimuth={azimuth} elevation={elevation} satname={satname} />
                    </div>
                </div>
            </div>
            <Footer sticky={true} />
        </>
    );
}

export async function getServerSideProps({ req }) {
    const forwarded = req.headers["x-forwarded-for"]
    const ip = forwarded ? forwarded.split(/, /)[0] : req.socket.remoteAddress
    const isLocalhost = ip === '127.0.0.1' || ip === '::1';

    const res = await axios.get(isLocalhost ? 'https://ipapi.co/json' : `https://ipapi.co/${ip}/json`);

    const { latitude, longitude } = res.data;

    return {
        props: {
            lat: latitude || 0,
            lng: longitude || 0,
        },
    }
}
