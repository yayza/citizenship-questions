const wa = require("weighted-arrays");
const getWeight = (obj) => obj.weight;
const party = require("party-js");

let data = [];
let currentIndex;
let currentWeight;

const questionText = document.querySelector("#question-text");
const answerText = document.querySelector("#answer-text");
const correctBtn = document.querySelector("#correct");
const incorrectBtn = document.querySelector("#incorrect");
const btnreveal = document.querySelector("#btn-reveal");
const btnNext = document.querySelector("#btn-next");
const spoiler = document.querySelector(".spoiler");
const correctNumberText = document.querySelector("#number-correct");
const correctPercentText = document.querySelector("#percent-correct");
const questionTranslation = document.querySelector("#question-translation");
const toggleTranslate = document.querySelector("#toggle-translate");

async function getData() {
  if (localStorage.getItem("ctznqstns") === null) {
    const res = await fetch("/data/questions.json")
      .then((response) => response.json())
      .then((data) => data)
      .catch((err) => console.log(err));
    for (const area of res.data) {
      for (const section of area.sections) {
        if (section.questions?.length > 0) {
          for (const question of section.questions) {
            question.area = area.name;
            question.section = section.name;
            question.weight = 1;
            question.correct = false;
            data.push(question);
          }
        }
      }
    }
    localStorage.setItem("ctznqstns", JSON.stringify(data));
  }
  data = JSON.parse(localStorage.getItem("ctznqstns"));
}

async function displayQuestion() {
  disableNext();
  disableRating();
  const numberCorrect = data.reduce((acc, curr) => {
    curr.correct == true ? acc++ : acc;
    return acc;
  }, 0);
  const percentCorrect = Math.round((numberCorrect / data.length) * 100);
  correctNumberText.textContent = `${numberCorrect}/${data.length}`;
  correctPercentText.textContent = `${percentCorrect}%`;

  percentCorrect >= 80
    ? (correctPercentText.style.color = "#00c144")
    : percentCorrect >= 60
    ? (correctPercentText.style.color = "#ff9900")
    : (correctPercentText.style.color = "#ff0000");

  const pickRandom = (arr, exclude) => {
    const random = wa.random(data, getWeight);
    if (data.indexOf(random) !== exclude) return random;
    else return pickRandom(arr, exclude);
  };

  const random = pickRandom(data, currentIndex);
  currentIndex = data.indexOf(random);
  currentWeight = random.weight;
  questionText.textContent = random.question;
  //   questionTranslation.textContent = random.translations.arabic;
  answerText.textContent = random.answer;
}

function enableNext() {
  btnNext.disabled = false;
  btnNext.classList.remove("btn-secondary");
  btnNext.classList.add("btn-primary");
}

function disableNext() {
  btnNext.disabled = true;
  btnNext.classList.remove("btn-primary");
  btnNext.classList.add("btn-secondary");
}

function enableRating() {
  correctBtn.disabled = false;
  incorrectBtn.disabled = false;
}

function disableRating() {
  correctBtn.disabled = true;
  incorrectBtn.disabled = true;
}

correctBtn.addEventListener("click", () => {
  enableNext();
  data[currentIndex].correct = true;
  data[currentIndex].weight = currentWeight - 2;
  data[currentIndex].weight < 1 ? (data[currentIndex].weight = 1) : data[currentIndex].weight;
  localStorage.setItem("ctznqstns", JSON.stringify(data));
});

incorrectBtn.addEventListener("click", () => {
  enableNext();
  data[currentIndex].correct = false;
  data[currentIndex].weight = currentWeight + 2;
  data[currentIndex].weight > 100 ? (data[currentIndex].weight = 100) : data[currentIndex].weight;
  localStorage.setItem("ctznqstns", JSON.stringify(data));
});

btnreveal.addEventListener("click", () => {
  spoiler.classList.add("hidden");
  enableRating();
});

btnNext.addEventListener("click", () => {
  spoiler.classList.remove("hidden");
  if (correctBtn.checked) {
    party.confetti(correctBtn, {
      count: party.variation.range(20, 40),
    });
  }
  correctBtn.checked = false;
  incorrectBtn.checked = false;
  displayQuestion();
});

document.addEventListener("DOMContentLoaded", async () => {
  await getData();
  displayQuestion();
});

document.body.onkeyup = function (e) {
  if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
    spoiler.classList.add("hidden");
    enableRating();
  }
};

toggleTranslate.addEventListener("mouseover", () => {
  questionText.textContent = data[currentIndex].translations.arabic.question;
  answerText.textContent = data[currentIndex].translations.arabic.answer;
});

toggleTranslate.addEventListener("mouseleave", () => {
  questionText.textContent = data[currentIndex].question;
  answerText.textContent = data[currentIndex].answer;
});
