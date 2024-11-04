var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let char1;
let char2;
let roundCounter = 0;
const maxRounds = 10;
function fetchRandomCharacter() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const offset = Math.floor(Math.random() * 10000);
        try {
            const res = yield fetch(`https://kitsu.io/api/edge/characters?page[limit]=1&page[offset]=${offset}`);
            const data = yield res.json();
            if (data.data && data.data[0]) {
                return {
                    name: data.data[0].attributes.canonicalName,
                    imageUrl: ((_a = data.data[0].attributes.image) === null || _a === void 0 ? void 0 : _a.original) || "/assets/placeholder.jpg"
                };
            }
            return fetchRandomCharacter();
        }
        catch (error) {
            console.error('Error fetching character:', error);
            return fetchRandomCharacter();
        }
    });
}
function getChars() {
    return __awaiter(this, void 0, void 0, function* () {
        const [character1, character2] = yield Promise.all([
            fetchRandomCharacter(),
            fetchRandomCharacter()
        ]);
        return [character1, character2];
    });
}
function addLoser(loser) {
    const img = document.createElement("img");
    img.src = loser.imageUrl;
    img.alt = loser.name;
    img.classList.add("loser-thumbnail");
    document.getElementById("loser-thumbnails").appendChild(img);
    const losers = JSON.parse(sessionStorage.getItem("losers") || "[]");
    losers.push(loser);
    sessionStorage.setItem("losers", JSON.stringify(losers));
}
function loadLosers() {
    const saved = JSON.parse(sessionStorage.getItem("losers") || "[]");
    saved.forEach((loser) => addLoser(loser));
}
function replaceChar(loser) {
    return __awaiter(this, void 0, void 0, function* () {
        const newChar = yield fetchRandomCharacter();
        if (loser === "char1") {
            addLoser(char1);
            char1 = newChar;
        }
        else {
            addLoser(char2);
            char2 = newChar;
        }
        showChars();
    });
}
function showChars() {
    document.getElementById("char1-name").innerText = char1.name;
    document.getElementById("char1-image").src = char1.imageUrl;
    document.getElementById("char2-name").innerText = char2.name;
    document.getElementById("char2-image").src = char2.imageUrl;
    // Ta bort ramen från båda karaktärerna
    document.getElementById("character1").classList.remove("winner-frame");
    document.getElementById("character2").classList.remove("winner-frame");
}
function updateRoundCounter() {
    document.getElementById("round-counter").innerText = `Round: ${roundCounter}`;
}
function declareWinner() {
    document.getElementById("character2").style.display = "none";
    document.getElementById("start-fight").style.display = "none";
    document.getElementById("loser-list").style.display = "none";
    document.getElementById("clear-losers").style.display = "none";
    document.getElementById("winner-label").innerText = "WINNER";
    document.getElementById("winner-display").style.display = "block";
    document.getElementById("play-again").onclick = () => location.reload();
}
function clearLosers() {
    document.getElementById("loser-thumbnails").innerHTML = "";
    sessionStorage.removeItem("losers");
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const [initialChar1, initialChar2] = yield getChars();
        char1 = initialChar1;
        char2 = initialChar2;
        showChars();
        updateRoundCounter();
        loadLosers();
        document.getElementById("start-fight").onclick = () => __awaiter(this, void 0, void 0, function* () {
            roundCounter++;
            updateRoundCounter();
            if (roundCounter >= maxRounds) {
                declareWinner();
            }
            else {
                const winner = Math.random() < 0.5 ? "char1" : "char2";
                // Lägg till ramen till vinnaren
                if (winner === "char1") {
                    document.getElementById("character1").classList.add("winner-frame");
                }
                else {
                    document.getElementById("character2").classList.add("winner-frame");
                }
                yield replaceChar(winner === "char1" ? "char2" : "char1");
            }
        });
        document.getElementById("clear-losers").onclick = clearLosers;
    });
}
init();
