fetch("http://localhost:8080/api/posts", {
  headers: {
    "Accept": "application/json"
  }
}).then(res => res.json()).then(console.log).catch(console.error);
