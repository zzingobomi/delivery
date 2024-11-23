#!/bin/bash

docker compose down
sudo chown -R zzingo:zzingo ./postgres
sudo chown -R zzingo:zzingo ./mongo