import { useState, useEffect } from "react";
import EmojiComponent from "./EmojiComponent";

var port
var reader
var writer

const ArduinoControl = ({ azimuth, elevation, satname }) => {
    const [connectionButton, setConnectionButton] = useState('Connect to Arduino');
    const [tracking, setTracking] = useState(false);
    const [antennaAzimuth, setAntennaAzimuth] = useState(0);
    const [antennaElevation, setAntennaElevation] = useState(0);

    useEffect(() => {
        if (tracking) {
            if (port && port.readable && port.writable) {
                writeArduinoData({
                    "op": "0",
                    "sa": satname,
                    "az": azimuth,
                    "el": elevation
                });
                document.getElementById('azimuth_input').value = Math.round(azimuth * 100) / 100;
                document.getElementById('elevation_input').value = Math.round(elevation * 100) / 100;
            } else {
                setTracking(false);
                alert('Connect to Arduino first.');
            }
        }
    }, [azimuth, elevation, tracking]);

    async function connectSerial() {
        const log = document.getElementById('target');
        try {
            port = await navigator.serial.requestPort()
        } catch (NotFoundError) {
            alert('No serial port found.');
            return;
        }
        try {
            await port.open({ baudRate: 9600 });
        } catch (e) {
            alert('Error opening serial port: ' + e);
            return;
        }

        const decoder = new TextDecoderStream();

        port.readable.pipeTo(decoder.writable);

        const inputStream = decoder.readable;
        reader = inputStream.getReader();
        writer = port.writable.getWriter();

        setConnectionButton('Disconnect from Arduino');

        while (true) {
            const { value, done } = await reader.read();
            if (value) {
                log.textContent += value + '\n';
            }
            console.log(value);
            if (done) {
                console.log('[readLoop] DONE', done);
                reader.releaseLock();
                writer.releaseLock();
                break;
            }
        }

    }

    async function writeToSerial(data) {
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(data));
    }

    async function closeSerial() {
        setConnectionButton('Connect to Arduino');

        try {
            reader.cancel();

            // Add a short delay (e.g., 100ms) before closing the port
            await new Promise(resolve => setTimeout(resolve, 100));

            if (port && port.readable) {
                await port.close();
            }
        } catch (error) {
            alert('Error while closing serial port:', error);
        }
    }

    function toArduinoFormat(json_data) {
        let str1 = "";
        for (let [key, value] of Object.entries(json_data)) {
            str1 += `${key}:${value};`;
        }
        return str1;
    }

    function writeArduinoData(data) {
        if (port && port.readable && port.writable) {
            writeToSerial(toArduinoFormat(data));
        } else {
            alert('Connect to Arduino first.');
        }
    }

    return (
        <div className='flex justify-center'>
            <div className='items-start w-full max-w-screen-lg px-4'>
                <div className="flex flex-col items-center w-full">
                    <button
                        className="bg-secondary border-2 border-border hover:bg-hover text-3xl rounded-xl transition duration-300 ease-in-out px-2 py-1 mb-3"
                        onClick={() => {
                            if (connectionButton === 'Disconnect from Arduino') {
                                closeSerial();
                                return;
                            }
                            if (navigator.serial) {
                                connectSerial();
                            } else {
                                alert('Web Serial API not supported.');
                            }
                        }}
                    >
                        {connectionButton}
                    </button>
                    <hr className="w-full border-[1px] border-border mb-16" />

                    <button onClick={() => setTracking(!tracking)} className="bg-primary border-2 border-border hover:bg-hover text-2xl rounded-xl transition duration-300 ease-in-out px-3 py-2 mb-3">
                        <EmojiComponent text={`${tracking ? 'Stop Tracking 🛑' : 'Start Tracking 🛰️'}`} />
                    </button>
                    <div className="flex items-center mb-3">
                        <span role="img" aria-label="azimuth" className='text-2xl'><EmojiComponent text="📡🧭 Azimuth" /></span>
                        <input
                            type="text"
                            className="border-2 border-border ml-[14px] px-2 py-1 w-20 bg-primary text-text rounded-md"
                            placeholder="0"
                            id='azimuth_input'
                        />
                        <button onClick={() => {
                            writeArduinoData({ "op": "1" });
                            setAntennaAzimuth(0);
                            document.getElementById('azimuth_input').value = 0;
                        }} className="bg-primary border-2 border-border hover:bg-hover text-xl rounded-xl transition duration-300 ease-in-out px-3 py-1 ml-2">
                            Set 0
                        </button>
                    </div>
                    <div className="flex items-center">
                        <span role="img" aria-label="elevation" className='text-2xl'><EmojiComponent text="📡🔭 Elevation" /></span>
                        <input
                            type="text"
                            className="border-2 border-border ml-2 px-2 py-1 w-20 bg-primary text-text rounded-md"
                            placeholder="0"
                            id="elevation_input"
                        />
                        <button onClick={() => {
                            writeArduinoData({ "op": "2" });
                            setAntennaElevation(0);
                            document.getElementById('elevation_input').value = 0;
                        }} className="bg-primary border-2 border-border hover:bg-hover text-xl rounded-xl transition duration-300 ease-in-out px-3 py-1 ml-2">
                            Set 0
                        </button>
                    </div>
                    <button onClick={() => {
                        setAntennaAzimuth(document.getElementById('azimuth_input').value);
                        setAntennaElevation(document.getElementById('elevation_input').value);
                        writeArduinoData({
                            "op": "3",
                            "az": antennaAzimuth,
                            "el": antennaElevation
                        });
                    }}
                        className="bg-primary border-2 border-border hover:bg-hover text-2xl rounded-xl transition duration-300 ease-in-out px-3 py-2 mt-3">
                        <EmojiComponent text="Manually Move Antenna 📡" />
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ArduinoControl;


