#!/bin/bash

ssh -i ~/chat-app-demo.pem ubuntu@ec2-3-82-57-59.compute-1.amazonaws.com << 'ENDSSH'
pm2 stop chat-app
rm -rf ~/workspace/Chat-App/
cd ~/workspace/
git clone https://github.com/Sudhir-Pawar/Chat-App.git
cd Chat-App
npm i
pm2 start chat-app
ENDSSH