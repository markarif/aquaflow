const bcrypt = require("bcryptjs");

async function run() {
  console.log("admin123 =>", await bcrypt.hash("admin123", 10));
  console.log("manager123 =>", await bcrypt.hash("manager123", 10));
  console.log("staff123 =>", await bcrypt.hash("staff123", 10));
}

run();