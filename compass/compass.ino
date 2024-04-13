#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_HMC5883_U.h>

Adafruit_HMC5883_Unified mag = Adafruit_HMC5883_Unified(12345);
const int CALIBRATION[6] = { -43, 2, -63, -14, 17, 21 };
int AVERAGE[3];

void setup() {
  Serial.begin(9600);

  /* Initialise the sensor */
  if (!mag.begin()) {
    /* There was a problem detecting the HMC5883 ... check your connections */
    Serial.println("Ooops, no HMC5883 detected ... Check your wiring!");
    while (1)
      ;
  }
  for (int i = 0; i < 6; i = i + 2) {
    AVERAGE[i] = (CALIBRATION[i] + CALIBRATION[i + 1]) / 2;
    Serial.println(AVERAGE[i]);
  }
}

void getXYZ(int *arr) {
  sensors_event_t event;
  mag.getEvent(&event);

  int x, y, z;
  // Fill array with XYZ coords
  arr[0] = event.magnetic.x + 21; //+ AVERAGE[0] + 16;
  arr[1] = event.magnetic.y + 25 + 22; //+ AVERAGE[1];
  arr[2] = event.magnetic.z; //+ AVERAGE[2];
}

// compass.setCalibration(-93, 10, -85, 0, -39, 67);

int getAzimuth(int X, int Y) {
  // float heading = atan2(Y, X) * 180.0 / PI;
  // // heading += _magneticDeclinationDegrees;
  // return (int)heading % 360;

  float heading = atan2(Y, X);
  return heading * 180/M_PI; 

}

void loop() {
  /* Get a new sensor event */
  // sensors_event_t event;
  // mag.getEvent(&event);

  // int x, y, z;
  int coords[3];
  getXYZ(coords);
  // // // Return XYZ readings
  // // x = event.magnetic.x;
  // // y = event.magnetic.y;
  // // z = event.magnetic.z;
  // // x = get_xyz();

  for (int i = 0; i < 3; i++) {
    if (i == 0) {
      Serial.print("x: ");
    } else if (i == 1) {
      Serial.print("y: ");
    } else if (i == 2) {
      Serial.print("z: ");
    }
    Serial.print(coords[i]);
    Serial.println(" ");
  }
  // // Hold the module so that Z is pointing 'up' and you can measure the heading with x&y
  // // Calculate heading when the magnetometer is level, then correct for signs of axis.
  // float heading = atan2(coords[1], coords[0]);

  // // Once you have your heading, you must then add your 'Declination Angle', which is the 'Error' of the magnetic field in your location.
  // // Find yours here: http://www.magnetic-declination.com/
  // // Mine is: -13* 2' W, which is ~13 Degrees, or (which we need) 0.22 radians
  // // If you cannot find your Declination, comment out these two lines, your compass will be slightly off.
  // float declinationAngle = 0.035;
  // heading += declinationAngle;

  // // Correct for when signs are reversed.
  // if (heading < 0)
  // heading += 2 * PI;

  // Check for wrap due to addition of declination.
  // if (heading > 2 * PI)
  // heading -= 2 * PI;

  // Convert radians to degrees for readability.
  // float headingDegrees = heading * 180 / M_PI;
  int degrees = getAzimuth(coords[0], coords[1]);
  Serial.print("Heading (degrees): ");
  Serial.println(degrees);

  delay(500);
}
