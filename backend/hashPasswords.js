const bcrypt = require("bcryptjs");

async function run() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const managerPassword = await bcrypt.hash("Manager123!", 10);
  const traineePassword = await bcrypt.hash("Trainee123!", 10);

  console.log("Admin hash:", adminPassword);
  console.log("Manager hash:", managerPassword);
  console.log("Trainee hash:", traineePassword);
}

run();