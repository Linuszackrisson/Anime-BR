type Character = {
  name: string;
  imageUrl: string;
};

type KitsuCharacterData = {
  attributes: {
      canonicalName: string;
      image?: {
          original: string;
      };
  };
};

type KitsuResponse = {
  data: KitsuCharacterData[];
};

let char1: Character;
let char2: Character;
let roundCounter = 0;
const maxRounds = 10;

async function fetchRandomCharacter(): Promise<Character> {
  const offset = Math.floor(Math.random() * 10000);
  try {
      const res = await fetch(`https://kitsu.io/api/edge/characters?page[limit]=1&page[offset]=${offset}`);
      const data: KitsuResponse = await res.json();
      if (data.data && data.data[0]) {
          return {
              name: data.data[0].attributes.canonicalName,
              imageUrl: data.data[0].attributes.image?.original || "/assets/placeholder.jpg"
          };
      }
      return fetchRandomCharacter();
  } catch (error) {
      console.error('Error fetching character:', error);
      return fetchRandomCharacter();
  }
}

async function getChars(): Promise<Character[]> {
  const [character1, character2] = await Promise.all([
      fetchRandomCharacter(),
      fetchRandomCharacter()
  ]);
  return [character1, character2];
}

function addLoser(loser: Character) {
  const img = document.createElement("img");
  img.src = loser.imageUrl;
  img.alt = loser.name;
  img.classList.add("loser-thumbnail");
  document.getElementById("loser-thumbnails")!.appendChild(img);
  const losers = JSON.parse(sessionStorage.getItem("losers") || "[]");
  losers.push(loser);
  sessionStorage.setItem("losers", JSON.stringify(losers));
}

function loadLosers() {
  const saved = JSON.parse(sessionStorage.getItem("losers") || "[]") as Character[];
  saved.forEach((loser) => addLoser(loser));
}

async function replaceChar(loser: "char1" | "char2") {
  const newChar = await fetchRandomCharacter();
  if (loser === "char1") {
      addLoser(char1);
      char1 = newChar;
  } else {
      addLoser(char2);
      char2 = newChar;
  }
  showChars();
}

function showChars() {
  document.getElementById("char1-name")!.innerText = char1.name;
  (document.getElementById("char1-image") as HTMLImageElement).src = char1.imageUrl;
  document.getElementById("char2-name")!.innerText = char2.name;
  (document.getElementById("char2-image") as HTMLImageElement).src = char2.imageUrl;

  // Ta bort ramen från båda karaktärerna
  (document.getElementById("char1-image") as HTMLImageElement).classList.remove("winner-frame");
  (document.getElementById("char2-image") as HTMLImageElement).classList.remove("winner-frame");
}

function updateRoundCounter() {
  document.getElementById("round-counter")!.innerText = `Round: ${roundCounter}`;
}

function declareWinner() {
  document.getElementById("character2")!.style.display = "none";
  document.getElementById("start-fight")!.style.display = "none";
  document.getElementById("loser-list")!.style.display = "none";
  document.getElementById("winner-label")!.innerText = "WINNER";
  document.getElementById("winner-display")!.style.display = "block";
  document.getElementById("play-again")!.onclick = () => location.reload();
}

function clearLosers() {
  document.getElementById("loser-thumbnails")!.innerHTML = "";
  sessionStorage.removeItem("losers");
}

async function init() {
  const [initialChar1, initialChar2] = await getChars();
  char1 = initialChar1;
  char2 = initialChar2;

  showChars();
  updateRoundCounter();
  loadLosers();

  document.getElementById("start-fight")!.onclick = async () => {
      roundCounter++;
      updateRoundCounter();

      if (roundCounter >= maxRounds) {
          declareWinner();
      } else {
          const winner = Math.random() < 0.5 ? "char1" : "char2";
          
          // Lägg till ramen till vinnaren
          if (winner === "char1") {
              (document.getElementById("char1-image") as HTMLImageElement).classList.add("winner-frame");
          } else {
              (document.getElementById("char2-image") as HTMLImageElement).classList.add("winner-frame");
          }

          await replaceChar(winner === "char1" ? "char2" : "char1");
      }
  };

  document.getElementById("clear-losers")!.onclick = clearLosers;
}

init();
