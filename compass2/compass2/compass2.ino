#include <Wire.h>
#include <HMC5883L.h>

HMC5883L compass;

int previousDegree;

void setup() {
  Serial.begin(9600);
  // 90.00:-1470.00:-594:359:-1726:0:-1271:0:-117:-863:-635
  // calibration values for HMC5883L
  compass.setOffset(-139, -779, -602);

  // Initialize HMC5883L
  Serial.println("Initialize HMC5883L");
  while (!compass.begin()) {
    Serial.println("HMC5883L not found, please check the connection!");
    delay(500);
  }

  // Setting the measurement range
  compass.setRange(HMC5883L_RANGE_1_3GA);

  // Setting the operating mode
  compass.setMeasurementMode(HMC5883L_CONTINOUS);

  // Setting the measurement frequency
  compass.setDataRate(HMC5883L_DATARATE_15HZ);

  // Number of averaged samples
  compass.setSamples(HMC5883L_SAMPLES_4);
}

void loop() {
  // Download compensated values
  Vector norm = compass.readNormalize();

  // Calculate direction (rad)

  // Min & Max X = -255 240 middle= -7.5
  // Min & Max Y = -690 -333 middle = -511.5
  // make the values have the same range at the top and bottom
  float compensatedX = norm.XAxis + 7.5;
  float compensatedY = norm.YAxis + 511.5;
  Serial.print("X = ");
  Serial.print(compensatedX);

  Serial.print(" Y = ");
  Serial.print(compensatedY);
  Serial.print(" ");

  float heading = atan2(compensatedY, compensatedX);

  // Setting the declination angle for Bytom 4'26E (positive)
  // Formula: (deg + (min / 60.0)) / (180 / M_PI);
  // float declinationAngle = (4.0 + (26.0 / 60.0)) / (180 / M_PI);
  // heading += declinationAngle;

  // Angle correction
  if (heading < 0) {
    heading += 2 * PI;
  }

  if (heading > 2 * PI) {
    heading -= 2 * PI;
  }

  // Convert radians to degrees
  float headingDegrees = heading * 180 / M_PI;

  // Output
  Serial.print(" Heading = ");
  Serial.print(heading);
  Serial.print(" Degress = ");
  Serial.print(headingDegrees);
  Serial.println();

  delay(100);

  delay(100);
}