
import { getDynamicHeaderLinks } from "./src/services/headerService";

async function test() {
  try {
    const links = await getDynamicHeaderLinks();
    console.log("Header links count:", links.length);
    console.log("Links:", JSON.stringify(links.map(l => l.title), null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
