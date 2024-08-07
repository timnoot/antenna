#include <Wire.h>
// Define pins
const int ELEVATION_STEP = 2;

const int AZIMUTH_STEP = 3;

const int ELEVATION_DIR = 4;
const int AZIMUTH_DIR = 5;

const int ELEVATION_ENDSWITCH = 9;

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

    pinMode(AZIMUTH_STEP, OUTPUT);    // step azimuth
    pinMode(ELEVATION_STEP, OUTPUT);  // step elevation

    pinMode(AZIMUTH_DIR, OUTPUT);    // azimuth direction
    pinMode(ELEVATION_DIR, OUTPUT);  // elavation direction

    pinMode(ELEVATION_ENDSWITCH, INPUT_PULLUP);  // Elevation endswitch
}

void do_step(int pin, int speed = 500) {
    digitalWrite(pin, HIGH);
    delayMicroseconds(speed);
    digitalWrite(pin, LOW);
    delayMicroseconds(speed);
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

    if (elevationStepsAbs > azimuthStepsAbs) {                          // Elevation is leading, because it has more steps
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
    // if (azimuthDegrees < 0 || azimuthDegrees > 360 || elevationDegrees < -10 || elevationDegrees > 90) {
    //   Serial.println("Invalid coordinates");
    //   return;
    // }
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

void set_zero_points() {
    // Find zero point for elevation
    digitalWrite(ELEVATION_DIR, DOWN);
    while (digitalRead(ELEVATION_ENDSWITCH) == 0) {
        do_step(ELEVATION_STEP, 250);
    }
    go_to_relative(0, 10);

    digitalWrite(ELEVATION_DIR, DOWN);
    while (digitalRead(ELEVATION_ENDSWITCH) == 0) {
        do_step(ELEVATION_STEP, 2000);
    }

    go_to_relative(0, 8);
    absoluteElevationDegrees = 0;
}

void readSerial() {
    if (Serial.available() > 0) {
        String arduinoStr = Serial.readString();
        int opCode = getValue(arduinoStr, "op").toInt();

        if (opCode == 0) {
            String azimuthStr = getValue(arduinoStr, "az");    // Azimuth
            String elevationStr = getValue(arduinoStr, "el");  // Elevation
            float azimuth = azimuthStr.toFloat();
            float elevation = elevationStr.toFloat();

            go_to(azimuth, elevation, 2);  // Break after 2 seconds to check for new data
        } else if (opCode == 1) {
            absoluteAzimuthDegrees = 0;
        } else if (opCode == 2) {
            absoluteElevationDegrees = 0;
        } else if (opCode == 3) {
            String azimuthStr = getValue(arduinoStr, "az");    // Azimuth
            String elevationStr = getValue(arduinoStr, "el");  // Elevation
            float azimuth = azimuthStr.toFloat();
            float elevation = elevationStr.toFloat();

            go_to(azimuth, elevation, 60);  // Break after 60 seconds to check for new data
        } else if (opCode == 4) {
            set_zero_points();
        }
    }
}

void loop() {
    readSerial();
}
