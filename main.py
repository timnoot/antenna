import time
import aiohttp
import aioserial
import asyncio
from logging import getLogger

from kivy.app import App
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.textinput import TextInput
from kivy.uix.gridlayout import GridLayout
from kivy.uix.dropdown import DropDown
from kivy.uix.popup import Popup

from kivy.core.window import Window

Window.size = (400, 300)

"""
NORAD ID's
----------------
NOAA 19 = 33591 # best
NOAA 18 = 28654 # best
NOAA 17 = 27453

NOAA 15 = 25338
"""

SATELLITES = [
    {"name": "NOAA 19", "norad_id": 33591},
    {"name": "NOAA 18", "norad_id": 28654},
    {"name": "NOAA 17", "norad_id": 27453},
    {"name": "NOAA 15", "norad_id": 25338},
    {"name": "STarlink", "norad_id": 45684},
    {"name": "ISS", "norad_id": 25544},
]


class CustomPopup(Popup):
    def __init__(self, title, message, **kwargs):
        super(CustomPopup, self).__init__(**kwargs)
        self.title = title
        self.size_hint = (None, None)
        self.size = (400, 200)

        self.label = Label(text=message, size_hint=(1, 1))
        self.content = self.label


class Client(App):
    API_KEY = "8HB8G9-HQZ5J3-XXPTVU-58JL"
    NORAD_ID = 33591
    LATITUDE = 52.019100
    LONGITUDE = 4.429700
    COM_PORT = "COM7"

    other_task = None

    """
    OP codes
    ----------------
    0 = position
    1 = set azimuth 0
    2 = set elevation 0
    3 = move azimuth and elevation to x
    """

    def __init__(self, _loop=None):
        super(Client, self).__init__()
        self.arduino: aioserial.AioSerial = None
        self.session: aiohttp.ClientSession = None
        self.loop: asyncio.AbstractEventLoop = _loop
        self.logger = getLogger('kivy')

        self.send_position = False
        self.azimuth = 0
        self.elevation = 0

        self.azimuth_input = None
        self.elevation_input = None
        self.azimuth_label = None
        self.elevation_label = None

    async def init(self):
        try:
            self.arduino = aioserial.AioSerial(port=self.COM_PORT, baudrate=9600)
        except Exception as e:
            self.logger.error(e)
            self.logger.error("Arduino not found")
        try:
            self.session = aiohttp.ClientSession()
        except Exception as e:
            self.logger.error(e)
            self.logger.error("Session not created")

    def update_coordinates(self):
        self.azimuth_label.text = f'Azimuth: {self.azimuth}'
        self.elevation_label.text = f'Elevation: {self.elevation}'

    def on_position_send_button(self, instance):
        self.send_position = not self.send_position
        # change the color of the button
        if self.send_position:
            instance.background_color = (1, 0, 0, 1)
            instance.text = "Stop sending position"
        else:
            instance.background_color = (0, 1, 0, 1)
            instance.text = "Start sending position"

    def select_satellite(self, instance):
        for satellite in SATELLITES:
            if satellite["name"] == instance.text:
                self.NORAD_ID = satellite["norad_id"]
                break
        pass

    def move_antenna(self, instance):
        # get the azimuth and elevation from the input fields
        try:
            temp_az = int(self.azimuth_input.text)
            temp_el = int(self.elevation_input.text)
        except ValueError:
            CustomPopup(title="Error", message="Azimuth and elevation must be integers").open()
            self.logger.error("Azimuth and elevation must be integers")
            return

        self.azimuth = temp_az
        self.elevation = temp_el

        self.update_coordinates()

        # send the data to the arduino
        asyncio.ensure_future(self.write_arduino({
            "op": "3",
            "az": self.azimuth,
            "el": self.elevation
        }))

    def azimuth_set_0(self, instance):
        self.azimuth = 0
        asyncio.ensure_future(self.write_arduino({
            "op": "1"
        }))
        self.azimuth_input.text = "0"
        self.update_coordinates()

    def elevation_set_0(self, instance):
        self.elevation = 0
        asyncio.ensure_future(self.write_arduino({
            "op": "2"
        }))
        self.elevation_input.text = "0"
        self.update_coordinates()

    def build(self):
        layout = BoxLayout(orientation='vertical', padding=10, spacing=10, size_hint=(None, None), size=(500, 400))

        # Button to send position
        position_send_button = Button(text='Start sending position', size_hint_y=None, height=40,
                                      background_color=(0, 1, 0, 1))
        position_send_button.bind(on_press=self.on_position_send_button)
        layout.add_widget(position_send_button)

        # Dropdown for selecting satellites
        dropdown = DropDown()
        for satellite in SATELLITES:
            btn = Button(text=satellite["name"], size_hint_y=None, height=40, background_color=(1, 1, 1, 1))
            btn.bind(on_release=lambda btn: dropdown.select(btn.text))
            btn.bind(on_release=self.select_satellite)
            dropdown.add_widget(btn)

        select_satellite_button = Button(text='Select Satellite', size_hint_y=None, height=40,
                                         background_color=(0, 0.7, 0.7, 1))
        select_satellite_button.bind(on_release=dropdown.open)
        dropdown.bind(on_select=lambda instance, x: setattr(select_satellite_button, 'text', x))
        layout.add_widget(select_satellite_button)

        # Input layout
        input_layout = GridLayout(cols=3, spacing=10, size_hint_y=None)
        input_layout.bind(minimum_height=input_layout.setter('height'))

        self.azimuth_label = Label(text=f'Azimuth: {self.azimuth}', size_hint=(None, None), size=(120, 40),
                                   halign='right')
        input_layout.add_widget(self.azimuth_label)
        self.azimuth_input = TextInput(hint_text='Enter azimuth', multiline=False, size_hint=(None, None),
                                       size=(200, 40))
        input_layout.add_widget(self.azimuth_input)

        azimuth_set_0_button = Button(text='Set 0', size_hint_y=None, height=40, background_color=(1, 1, 1, 1))
        azimuth_set_0_button.bind(on_press=self.azimuth_set_0)
        input_layout.add_widget(azimuth_set_0_button)

        self.elevation_label = Label(text=f'Elevation: {self.elevation}', size_hint=(None, None), size=(120, 40),
                                     halign='right')
        input_layout.add_widget(self.elevation_label)
        self.elevation_input = TextInput(hint_text='Enter elevation', multiline=False, size_hint=(None, None),
                                         size=(200, 40))
        input_layout.add_widget(self.elevation_input)

        elevation_set_0_button = Button(text='Set 0', size_hint_y=None, height=40, background_color=(1, 1, 1, 1))
        elevation_set_0_button.bind(on_press=self.elevation_set_0)
        input_layout.add_widget(elevation_set_0_button)

        layout.add_widget(input_layout)

        # Button to move antenna
        move_button = Button(text='Move antenna', size_hint_y=None, height=40, background_color=(0, 0.7, 0.7, 1))
        move_button.bind(on_press=self.move_antenna)
        layout.add_widget(move_button)

        return layout

    async def get_satellite_location(self, norad_id, latitude, longitude) -> dict:
        async with self.session.get(
                f"https://api.n2yo.com/rest/v1/satellite/positions/{norad_id}/{latitude}/{longitude}/0/2/?apiKey={self.API_KEY}"
        ) as response:
            res = await response.json()
            """
            azimuth = Degrees from north
            elevation = Degrees up from ground
            https://www.celestis.com/media/3811/az_elevation.jpg
            """
            azimuth = res["positions"][0]["azimuth"]
            elevation = res["positions"][0]["elevation"]
            self.logger.info(f'{res["info"]["satname"]} - az={azimuth}°, el={elevation}°')

            return {
                "op": "0",
                "sa": res["info"]["satname"],
                "az": azimuth,
                "el": elevation
            }

    async def write_arduino(self, x):
        await self.arduino.write_async(self.to_arduino_format(x).encode())

    @staticmethod
    def to_arduino_format(json_data):
        str1 = ""
        for key, value in json_data.items():
            str1 += f"{key}:{value};"
        return str1

    async def main(self):
        self.logger.info("Starting main")
        await self.init()
        start = time.time()

        while True:
            if time.time() - start > 1 and self.send_position:
                r = await self.get_satellite_location(self.NORAD_ID, self.LATITUDE, self.LONGITUDE)
                await self.write_arduino(r)

                self.azimuth = r["az"]
                self.elevation = r["el"]
                self.update_coordinates()
                start = time.time()

            await asyncio.sleep(0.1)

    def startup(self):
        """This will run both methods asynchronously and then block until they
        are finished
        """
        self.other_task = asyncio.ensure_future(self.main())

        async def run_wrapper():
            # we don't actually need to set asyncio as the lib because it is
            # the default, but it doesn't hurt to be explicit
            await self.async_run(async_lib='asyncio')
            print('App done')
            self.other_task.cancel()

        return asyncio.gather(run_wrapper(), self.other_task)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(Client(loop).startup())
    loop.close()
