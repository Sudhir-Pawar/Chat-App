#!/bin/bash

ssh -i ~/chat-app-demo.pem ubuntu@ec2-54-210-16-175.compute-1.amazonaws.com << 'ENDSSH'
pm2 stop all
rm -rf ~/workspace/Chat-App/
cd ~/workspace/
git clone https://github.com/Sudhir-Pawar/Chat-App.git
cd Chat-App
npm i
pm2 start all
ENDSSH