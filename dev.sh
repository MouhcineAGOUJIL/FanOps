#!/bin/bash
# Increase file descriptor limit and start Vite
ulimit -n 65536
exec vite "$@"

