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

void rotate_azimuth(int degrees, bool direction) {
  // RIGHT = UP
  // LEFT = DOWN
  if (direction == RIGHT) {
    digitalWrite(AZIMUTH_DIR, RIGHT);
    digitalWrite(ELEVATION_DIR, UP);
  } else if (direction == LEFT) {
    digitalWrite(AZIMUTH_DIR, LEFT);
    digitalWrite(ELEVATION_DIR, DOWN);
  }

  for (int i = 0; i < 8000; i++) {
    if (i % 5 == 0) {
      step_elevation();
      step_elevation();
    }
    step_azimuth();
  }
}

void loop() {
  delay(5000);
  rotate_azimuth(360, RIGHT);
  delay(5000);
}
