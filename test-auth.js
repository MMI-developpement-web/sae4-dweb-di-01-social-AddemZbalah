const fs = require('fs');
fetch("http://localhost:8080/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", password: "password" })
}).then(r => r.json()).then(console.log).catch(console.error);
