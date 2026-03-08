const { networkInterfaces } = require("os");

/** Préfère les IP de réseau local (Wi-Fi / Ethernet) plutôt que virtuelles (172.x WSL, etc.) */
function isPreferredLan(addr) {
  return addr.startsWith("192.168.") || addr.startsWith("10.");
}

const nets = networkInterfaces();
const candidates = [];

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    if (net.family === "IPv4" && !net.internal) {
      candidates.push({ address: net.address, name });
    }
  }
}

// Préférer 192.168.x.x ou 10.x.x.x (réseau local typique)
const preferred = candidates.find((c) => isPreferredLan(c.address));
const chosen = preferred || candidates[0];

if (chosen) {
  console.log("\n  Sur votre tablette, tapez cette adresse dans le navigateur :\n");
  console.log("  http://" + chosen.address + ":3000\n");
  if (candidates.length > 1 && !preferred) {
    console.log("  (Si ça ne marche pas, essayez l'IP Wi-Fi affichée par ipconfig)\n");
  }
} else {
  console.log("  Adresse non trouvée. Vérifiez que le PC est connecté au Wi-Fi.\n");
}
