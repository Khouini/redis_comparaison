#!/bin/bash

# Redis host and port
REDIS_HOST="localhost"
REDIS_PORT=6379

# Function to measure internet speed
measure_speed() {
  echo "Measuring internet speed..."
  speedtest-cli --simple
}

# Connect to Redis and perform commands
redis_command() {
  local command=$1
  echo "Executing Redis command: $command"
  redis-cli -h $REDIS_HOST -p $REDIS_PORT $command
}

# Measure speed before the request
echo "Speed before the Redis request:"
measure_speed

# Perform Redis SET command
redis_command "SET mykey 'Hello, Redis!'"

# Measure speed after the request
echo "Speed after the Redis request:"
measure_speed

# Perform Redis GET command
redis_command "GET mykey"

# Measure speed after the request
echo "Speed after the Redis request:"
measure_speed
