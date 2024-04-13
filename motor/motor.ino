int ELEVATION_STEP = 2;
int AZIMUTH_STEP = 3;

int ELEVATION_DIR = 4;
int AZIMUTH_DIR = 5;

typedef enum {
  RIGHT = true,
  LEFT = false,

  UP = false,
  DOWN = true

};

void setup() {
  Serial.begin(9600);               // open de serial
  pinMode(ELEVATION_STEP, OUTPUT);  // step elevation
  pinMode(AZIMUTH_STEP, OUTPUT);    // step azimuth

  pinMode(ELEVATION_DIR, OUTPUT);    // elavation direction
  pinMode(AZIMUTH_DIR, OUTPUT);      // azimuth direction
  digitalWrite(ELEVATION_DIR, LOW);  // elavation direction HIGH = omlaag, LOW = omhoog
  digitalWrite(AZIMUTH_DIR, HIGH);   // azimuth direction HIGH = rechtsom, LOW = linksom

  delay(1000);
}

void step_azimuth() {
  digitalWrite(AZIMUTH_STEP, HIGH);
  delay(1);
  digitalWrite(AZIMUTH_STEP, LOW);
  delay(1);
}

void step_elevation() {
  digitalWrite(ELEVATION_STEP, HIGH);
  delay(1);
  digitalWrite(ELEVATION_STEP, LOW);
  delay(1);
}

void rotate_azimuth(float degrees, bool direction) {
  // RIGHT = UP
  // LEFT = DOWN
  if (direction == RIGHT) {
    digitalWrite(AZIMUTH_DIR, RIGHT);
    digitalWrite(ELEVATION_DIR, UP);
  } else if (direction == LEFT) {
    digitalWrite(AZIMUTH_DIR, LEFT);
    digitalWrite(ELEVATION_DIR, DOWN);
  } else {
    return;
  }
  int stepsAmount = (8000 / 360) * degrees;

  for (int i = 0; i < stepsAmount; i++) {
    if (i % 5 == 0) {
      step_elevation();
      step_elevation();
    }
    step_azimuth();
  }
}

void rotate_elevation(int steps, bool direction) {
  // RIGHT = UP
  // LEFT = DOWN
  if (direction == UP) {
    digitalWrite(ELEVATION_DIR, UP);
  } else if (direction == DOWN) {
    digitalWrite(ELEVATION_DIR, DOWN);
  } else {
    return;
  }
  // int stepsAmount = (2000 / 360) * degrees;

  for (int i = 0; i < steps; i++) {
    step_elevation();
    step_elevation();
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
