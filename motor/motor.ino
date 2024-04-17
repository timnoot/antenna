#include <Wire.h>
// Define pins
const int ELEVATION_STEP = 2;
const int AZIMUTH_STEP = 3;

const int ELEVATION_DIR = 4;
const int AZIMUTH_DIR = 5;

typedef enum {
  RIGHT = true,
  LEFT = false,

  UP = false,
  DOWN = true
} Direction;

void setup() {
  Serial.begin(9600);               // open de serial
  pinMode(ELEVATION_STEP, OUTPUT);  // step elevation
  pinMode(AZIMUTH_STEP, OUTPUT);    // step azimuth

  pinMode(ELEVATION_DIR, OUTPUT);    // elavation direction
  pinMode(AZIMUTH_DIR, OUTPUT);      // azimuth direction
  // digitalWrite(ELEVATION_DIR, LOW);  // elavation direction HIGH = omlaag, LOW = omhoog
  // digitalWrite(AZIMUTH_DIR, HIGH);   // azimuth direction HIGH = rechtsom, LOW = linksom

  delay(1000);
}

void do_step(int pin) {
  digitalWrite(pin, HIGH);
  delay(1);
  digitalWrite(pin, LOW);
  delay(1);
}

void rotate_azimuth(float degrees, Direction direction) {
  digitalWrite(AZIMUTH_DIR, direction);

  // RIGHT = UP
  // LEFT = DOWN
  if (direction == RIGHT) {
    digitalWrite(ELEVATION_DIR, UP);
  } else if (direction == LEFT) {
    digitalWrite(ELEVATION_DIR, DOWN);
  } 

  int stepsAmount = (8000 / 360) * degrees;

  for (int i = 0; i < stepsAmount; i++) {
    if (i % 5 == 0) {
      do_step(ELEVATION_STEP);
      do_step(ELEVATION_STEP);
    }
    do_step(AZIMUTH_STEP);
  }
}

void rotate_elevation(int steps, Direction direction) {
  digitalWrite(ELEVATION_DIR, direction);  
  // int stepsAmount = (2000 / 360) * degrees;

  for (int i = 0; i < steps; i++) {
    do_step(ELEVATION_STEP);
  }
}

void loop() {
  for (int i = 0; i < 360; i++) {
    rotate_azimuth(0.5, RIGHT);
    rotate_elevation(7, DOWN);
  }
  delay(5000);
  for (int i = 0; i < 360; i++) {
    rotate_azimuth(0.5, LEFT);
    rotate_elevation(7, UP);
  }
  delay(5000);
}
