#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n com.bandwidth.ReactNativePhone/host.exp.exponent.MainActivity
