#!/bin/bash

<<<<<<< HEAD
./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n host.exp.exponent/host.exp.exponent.LauncherActivity
=======
./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n com.bandwidth.ReactNativePhone/host.exp.exponent.MainActivity
>>>>>>> a654a7dbc866732ee28df7a72142c5114e80a908
