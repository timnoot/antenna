import asyncio
import aioserial

arduino = aioserial.AioSerial(port='COM7', baudrate=9600)


async def read_and_print(aioserial_instance: aioserial.AioSerial):
    while True:
        print((await aioserial_instance.read_async()).decode(errors='ignore'), end='', flush=True)


asyncio.run(read_and_print(arduino))
