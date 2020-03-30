#!/bin/bash

branchCheckout=$3

if [[ $branchCheckout -eq 1 ]]; then
  echo Stopping slate watcher...
  touch config.yml;
  echo Watcher stopped.
fi 