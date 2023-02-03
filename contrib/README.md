To use as a service

  cp coffee.service /lib/systemd/system/
  systemctl daemon-reload
  systemctl enable coffee
  systemctl start coffee
