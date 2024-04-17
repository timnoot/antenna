#include <Wire.h>
// Define pins
const int ELEVATION_STEP = 2;
const int AZIMUTH_STEP = 3;

const int ELEVATION_DIR = 4;
const int AZIMUTH_DIR = 5;

// Settings
const int STEPS_PER_CIRCLE = 3200;  // 200 steps per revolution * 16 microsteps

const float AZIMUTH_GEAR_RATIO = 2.5;
const float ELEVATION_GEAR_RATIO = 22;

typedef enum {
  RIGHT = true,
  LEFT = false,

  UP = false,
  DOWN = true
} Direction;

void setup() {
  Serial.begin(9600);  // open de serial

  pinMode(AZIMUTH_STEP, OUTPUT);    // step azimuth
  pinMode(ELEVATION_STEP, OUTPUT);  // step elevation

  pinMode(AZIMUTH_DIR, OUTPUT);    // azimuth direction
  pinMode(ELEVATION_DIR, OUTPUT);  // elavation direction
}

void do_step(int pin) {
  digitalWrite(pin, HIGH);
  delay(1);
  digitalWrite(pin, LOW);
  delay(1);
}

void go_to_relative(float azimuthDegrees, float elevationDegrees) {
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

    while (elevationStepsAbs) {  // While there are still elevation steps to take
      do_step(ELEVATION_STEP);
      elevationStepsAbs--;
      if ((elevationStepsAbs / azimuthStepsAbs) < orignialStepRatio) {
        do_step(AZIMUTH_STEP);  // If the ratio between the steps is less than the original ratio, take an azimuth step
        azimuthStepsAbs--;
      }
    }
  } else {  // Azimuth is leading, because it has more steps
    float orignialStepRatio = azimuthStepsAbs / elevationStepsAbs;

    while (azimuthStepsAbs) {
      do_step(AZIMUTH_STEP);
      azimuthStepsAbs--;
      if ((azimuthStepsAbs / elevationStepsAbs) < orignialStepRatio) {
        do_step(ELEVATION_STEP);  // If the ratio between the steps is less than the original ratio, take an elevation step
        elevationStepsAbs--;
      }
    }
  }
}

void loop() {
  go_to_relative(180, 45);
  delay(5000);
  go_to_relative(-180, -45);
  delay(5000);
}
