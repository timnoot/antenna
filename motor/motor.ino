#include <limits.h>
#include <math.h>

#include <Wire.h>
#include <HMC5883L.h>

HMC5883L compass;

// Define pins
const int ELEVATION_STEP = 2;
const int AZIMUTH_STEP = 3;

const int ELEVATION_DIR = 4;
const int AZIMUTH_DIR = 5;

// Settings
const int STEPS_PER_CIRCLE = 3200;  // 200 steps per revolution * 16 microsteps

const float AZIMUTH_GEAR_RATIO = 2.5;
const float ELEVATION_GEAR_RATIO = 22;

// Global Variables
float absoluteAzimuthDegrees = 0;    // 0 degrees is north
float absoluteElevationDegrees = 0;  // 0 degrees is horizontal

typedef enum {
  RIGHT = true,
  LEFT = false,

  UP = false,
  DOWN = true
} Direction;

void setup() {
  Serial.begin(9600);  // open de serial

  // set outputs
  pinMode(AZIMUTH_STEP, OUTPUT);    // step azimuth
  pinMode(ELEVATION_STEP, OUTPUT);  // step elevation

  pinMode(AZIMUTH_DIR, OUTPUT);    // azimuth direction
  pinMode(ELEVATION_DIR, OUTPUT);  // elavation direction

  // Initialize HMC5883L
  // 90.00:-1470.00:-594:359:-1726:0:-1271:0:-117:-863:-635
  // calibration values for HMC5883L
  // compass.setOffset(-139, -779, -602);

  while (!compass.begin()) {
    Serial.println("HMC5883L not found, please check the connection!");
    delay(500);
  }
  compass.setRange(HMC5883L_RANGE_1_3GA);          // Setting the measurement range
  compass.setMeasurementMode(HMC5883L_CONTINOUS);  // Setting the operating mode
  compass.setDataRate(HMC5883L_DATARATE_15HZ);     // Setting the measurement frequency
  compass.setSamples(HMC5883L_SAMPLES_4);          // Number of averaged samples

  set_zero_points();
}

void do_step(int pin) {
  digitalWrite(pin, HIGH);
  delayMicroseconds(500);
  digitalWrite(pin, LOW);
  delayMicroseconds(500);
}

void go_to_relative(float azimuthDegrees, float elevationDegrees, int breakAfterSeconds = 60) {
  unsigned long startTime = millis();  // Start time of the current movement

  // Rotate both azimuth and elevation at the same time
  int azimuthSteps = ((STEPS_PER_CIRCLE * AZIMUTH_GEAR_RATIO) / 360.0) * azimuthDegrees;
  int elevationSteps = ((STEPS_PER_CIRCLE * ELEVATION_GEAR_RATIO) / 360.0) * elevationDegrees;

  // For every 2.5 azimuth steps, add 1 elevation step in the opposite direction
  elevationSteps += azimuthSteps / AZIMUTH_GEAR_RATIO;

  // Set direction
  digitalWrite(AZIMUTH_DIR, azimuthSteps > 0 ? RIGHT : LEFT);   // Positive = right, negative = left
  digitalWrite(ELEVATION_DIR, elevationSteps > 0 ? UP : DOWN);  // Positive = up, negative = down

  // Absolute value of steps
  float azimuthStepsAbs = abs(azimuthSteps);
  float elevationStepsAbs = abs(elevationSteps);

  if (elevationStepsAbs > azimuthStepsAbs) {                        // Elevation is leading, because it has more steps
    float orignialStepRatio = elevationStepsAbs / azimuthStepsAbs;  // Calculate the ratio between the steps

    while (elevationStepsAbs && millis() - startTime < breakAfterSeconds * 1000) {
      do_step(ELEVATION_STEP);
      elevationStepsAbs--;
      if ((elevationStepsAbs / azimuthStepsAbs) < orignialStepRatio) {
        do_step(AZIMUTH_STEP);  // If the ratio between the steps is less than the original ratio, take an azimuth step
        azimuthStepsAbs--;
      }
    }
  } else {  // Azimuth is leading, because it has more steps
    float orignialStepRatio = azimuthStepsAbs / elevationStepsAbs;

    while (azimuthStepsAbs && millis() - startTime < breakAfterSeconds * 1000) {
      do_step(AZIMUTH_STEP);
      azimuthStepsAbs--;
      if ((azimuthStepsAbs / elevationStepsAbs) < orignialStepRatio) {
        do_step(ELEVATION_STEP);  // If the ratio between the steps is less than the original ratio, take an elevation step
        elevationStepsAbs--;
      }
    }
  }
}

void go_to(float azimuthDegrees, float elevationDegrees, int breakAfterSeconds = 60) {
  if (azimuthDegrees < 0 || azimuthDegrees > 360 || elevationDegrees < -10 || elevationDegrees > 90) {
    Serial.println("Invalid coordinates");
    return;
  }
  // if within 0.1 degree of the current position, don't move
  if (abs(azimuthDegrees - absoluteAzimuthDegrees) < 0.1 && abs(elevationDegrees - absoluteElevationDegrees) < 0.1) {
    return;
  }

  go_to_relative(azimuthDegrees - absoluteAzimuthDegrees, elevationDegrees - absoluteElevationDegrees, breakAfterSeconds);
  absoluteAzimuthDegrees = azimuthDegrees;
  absoluteElevationDegrees = elevationDegrees;
}

String getValue(String arduinoStr, String key) {
  // example jsonStr: "sa:NOAA 18;az:20.10;el:9.67;"
  int keyIndex = arduinoStr.indexOf(key);
  if (keyIndex == -1) {
    return "";
  }
  int valueIndex = keyIndex + key.length() + 1;
  int nextDelimiterIndex = arduinoStr.indexOf(";", valueIndex);
  if (nextDelimiterIndex == -1) {
    nextDelimiterIndex = arduinoStr.length();
  }
  return arduinoStr.substring(valueIndex, nextDelimiterIndex);
}

void updatePosition() {
  if (Serial.available() > 0) {
    String arduinoStr = Serial.readString();
    String azimuthStr = getValue(arduinoStr, "az");    // Azimuth
    String elevationStr = getValue(arduinoStr, "el");  // Elevation
    float azimuth = azimuthStr.toFloat();
    float elevation = elevationStr.toFloat();

    String satteliteStr = getValue(arduinoStr, "sa");  // Sattelite name
    // keep checking for new data while moving

    go_to(azimuth, elevation, 2);  // Break after 2 seconds to check for new data
  }
}

void set_zero_points() {
  int smallestYDegree = 0;
  int smallestYValue = INT_MAX;
  int biggestYDegree = 0;
  int biggestYValue = INT_MIN;

  int smallestXDegree = 0;
  int smallestXValue = INT_MAX;
  int biggestXDegree = 0;
  int biggestXValue = INT_MIN;

  float sumX = 0.0;
  float sumY = 0.0;

  for (int i = 0; i < 360; i++) {
    go_to(i, 0);
    delay(100);
    // read raw values
    Vector mag = compass.readRaw();
    Serial.print("Degree: ");
    Serial.print(i);
    Serial.print(" X = ");
    Serial.print(mag.XAxis);
    Serial.print(" Y = ");
    Serial.print(mag.YAxis);
    Serial.println();

    if (mag.YAxis < smallestYValue) {
      smallestYValue = mag.YAxis;
      smallestYDegree = i;
    }
    if (mag.YAxis > biggestYValue) {
      biggestYValue = mag.YAxis;
      biggestYDegree = i;
    }
    if (mag.XAxis < smallestXValue) {
      smallestXValue = mag.XAxis;
      smallestXDegree = i;
    }
    if (mag.XAxis > biggestXValue) {
      biggestXValue = mag.XAxis;
      biggestXDegree = i;
    }
  }

  Serial.print("Smallest Y: ");
  Serial.print(smallestYDegree);
  Serial.print(" Biggest Y: ");
  Serial.print(biggestYDegree);
  Serial.print(" Smallest X: ");
  Serial.print(smallestXDegree);
  Serial.print(" Biggest X: ");
  Serial.print(biggestXDegree);
  Serial.println();

  // turn to the smallest Y
  int xDegree = smallestXDegree - 90;
  int yDegree = smallestYDegree - 180;
  int xDegree2 = biggestXDegree - 270;

  int north = (biggestYDegree + yDegree + xDegree + xDegree2) / 4;

  Serial.print("North: ");
  Serial.println(north);
  go_to_relative(north, 0);

  delay(10000);
  go_to(0, 0);
}

void loop() {
  // for (int i = 0; i < 360; i++) {
  //   go_to(i, 0);
  //   delay(100);
  // }
}

// void loop() {
//   // Download compensated values
//   Vector norm = compass.readNormalize();

//   // Calculate direction (rad)

//   // Min & Max X = -255 240 middle= -7.5
//   // Min & Max Y = -690 -333 middle = -511.5
//   // make the values have the same range at the top and bottom
//   float compensatedX = norm.XAxis + 7.5;
//   float compensatedY = norm.YAxis + 511.5;
//   Serial.print("X = ");
//   Serial.print(compensatedX);

//   Serial.print(" Y = ");
//   Serial.print(compensatedY);
//   Serial.print(" ");

//   float heading = atan2(compensatedY, compensatedX);

//   // Setting the declination angle for Bytom 4'26E (positive)
//   // Formula: (deg + (min / 60.0)) / (180 / M_PI);
//   // float declinationAngle = (4.0 + (26.0 / 60.0)) / (180 / M_PI);
//   // heading += declinationAngle;

//   // Angle correction
//   if (heading < 0) {
//     heading += 2 * PI;
//   }

//   if (heading > 2 * PI) {
//     heading -= 2 * PI;
//   }

//   // Convert radians to degrees
//   float headingDegrees = heading * 180 / M_PI;

//   // Output
//   Serial.print(" Heading = ");
//   Serial.print(heading);
//   Serial.print(" Degress = ");
//   Serial.print(headingDegrees);
//   Serial.println();

//   delay(100);

//   delay(100);
// }