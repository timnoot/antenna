import requests
import serial
import time

API_KEY = "8HB8G9-HQZ5J3-XXPTVU-58JL"
arduino = serial.Serial(port='COM4', baudrate=9600, timeout=.1)

"""
NORAD ID's
----------------
NOAA 19 = 33591
NOAA 15 = 25338
NOAA 18 = 28654
NOAA 17 = 27453
"""

NORAD_ID = 28654
LATITUDE = 52.019100
LONGITUDE = 4.429700


def get_satellite_location(norad_id, latitude, longitude) -> dict:
    r = requests.get(
        f"https://api.n2yo.com/rest/v1/satellite/positions/{norad_id}/{latitude}/{longitude}/0/2/?apiKey={API_KEY}"
    )
    res = r.json()
    print(res["info"]["satname"])
    """
    azimuth = Degrees from north
    elevation = Degrees up from ground
    https://www.celestis.com/media/3811/az_elevation.jpg
    """
    azimuth = res["positions"][0]["azimuth"]
    elevation = res["positions"][0]["elevation"]

    print(f"az={azimuth}°, el={elevation}°")
    return {
        "sa": res["info"]["satname"],
        "az": azimuth,
        "el": elevation
    }


def write_arduino(x):
    arduino.write(bytes(x, 'utf-8'))
    time.sleep(0.05)
    data = arduino.readline()
    return data


def json_to_arduino_format(json_data):
    str1 = ""
    for key, value in json_data.items():
        str1 += f"{key}:{value};"
    return str1


while True:
    r = get_satellite_location(NORAD_ID, LATITUDE, LONGITUDE)
    write_arduino(json_to_arduino_format(r))
    time.sleep(0.5)
