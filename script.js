console.log('Script loaded');

document.getElementById('close-btn')?.addEventListener('click', () => {
  console.log('Close clicked');
  window.electronAPI?.closeWindow();
});

document.getElementById('min-btn')?.addEventListener('click', () => {
  console.log('Minimize clicked');
  window.electronAPI?.minimizeWindow();
});

const sounds = {
  num: new Audio('assets/sounds/num.mp3'),
  equals: new Audio('assets/sounds/equals.mp3'),
  operator: new Audio('assets/sounds/operator.mp3'),
  delete: new Audio('assets/sounds/delete.mp3'),
  ac: new Audio('assets/sounds/ac.mp3'),
}

function playSound(type){
  if(sounds[type]){
    sounds[type].currentTime = 0;
    sounds[type].play();
  }
}

let display = document.querySelector("#display h2");
let currentInput = "";
let operator = null;
let firstOperand = null;

function updateDisplay(value) {
  display.textContent = value.toString().slice(0, 8); // Max 8 digits
}

function updateDelButton() {
  const delBtn = document.querySelector(".del");

  if (
    currentInput === "" ||
    currentInput === "0" ||
    display.textContent === "0" ||
    operator === null && firstOperand === null
  ) {
    delBtn.textContent = "AC";
  } else {
    delBtn.textContent = "⌫";
  }
}


function clear() {
  const delBtn = document.querySelector(".del");

  // If button says "AC", clear everything
  if (delBtn.textContent === "AC") {
    playSound('ac');
    currentInput = "";
    operator = null;
    firstOperand = null;
    updateDisplay("0");
  } 
  // If button says "⌫", delete last digit
  else {
    playSound('delete');
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput || "0");
  }

  updateDelButton();
}


function appendNumber(num) {
  if (currentInput.length >= 10) return;
  currentInput += num;
  updateDisplay(currentInput);
  updateDelButton();
}

function chooseOperator(op) {
  if (currentInput === "") return;
  if (firstOperand === null) {
    firstOperand = parseFloat(currentInput);
  } else {
    firstOperand = operate(operator, firstOperand, parseFloat(currentInput));
  }
  playSound('operator');
  operator = op;
  currentInput = "";
  updateDisplay(formatResult(firstOperand));
  updateDelButton();
}

function operate(op, a, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? "Err" : a / b;
    default: return b;
  }
}

function evaluate() {
  if (operator === null || currentInput === "") return;
  let result = operate(operator, firstOperand, parseFloat(currentInput));
  result = formatResult(result);
  updateDisplay(result);
  currentInput = result.toString();
  operator = null;
  firstOperand = null;
  updateDelButton(); // Reset back to AC
}

function formatResult(result) {
  if (result === "Err") return result;

  if (Math.abs(result) >= 1e8 || Math.abs(result) < 0.000001) {
    return result.toExponential(2); // e.g., 1.23e+8
  }

  return parseFloat(result.toPrecision(8));
}

function toggleSign() {
  if (currentInput) {
    currentInput = (parseFloat(currentInput) * -1).toString();
    updateDisplay(currentInput);
    updateDelButton();
  }
}

function percent() {
  if (currentInput) {
    currentInput = (parseFloat(currentInput) / 100).toString();
    updateDisplay(currentInput);
    updateDelButton();
  }
}

// Button Bindings
document.querySelector(".del").addEventListener("click", () => {
  clear();
});
document.querySelector(".plus-minus").addEventListener("click", () => {
  toggleSign();
  playSound('operator');
});
document.querySelector(".percent").addEventListener("click", () => {
  percent();
  playSound('operator');
});
document.querySelector(".divide").addEventListener("click", () => {
  chooseOperator("/");
  playSound('operator');
});
document.querySelector(".multiply").addEventListener("click", () => {
  chooseOperator("*");
  playSound('operator');
});
document.querySelector(".minus").addEventListener("click", () => {
  chooseOperator("-");
  playSound('operator');
});
document.querySelector(".plus").addEventListener("click", () => {
  chooseOperator("+");
  playSound('operator');
});
document.querySelector(".equals").addEventListener("click", () => {
  evaluate();
  sounds.equals.volume = 0.2;
  playSound('equals');
});
document.querySelector(".dot").addEventListener("click", () => {
  playSound('operator');
  if (!currentInput.includes(".")) {
    currentInput += currentInput === "" ? "0." : ".";
    updateDisplay(currentInput);
    updateDelButton();
  }
});

// Number buttons
["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"].forEach((numClass, index) => {
  document.querySelector(`.${numClass}`).addEventListener("click", () => {
    appendNumber(index.toString());
    playSound('num');
  });
});

// Keyboard Support
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (!isNaN(key)) appendNumber(key);
  if (key === ".") {
    playSound('operator');
    if (!currentInput.includes(".")) {
      currentInput += currentInput === "" ? "0." : ".";
      updateDisplay(currentInput);
      updateDelButton();
    }
  }

  if (key === "+") chooseOperator("+");
  if (key === "-") chooseOperator("-");
  if (key === "*" || key === "x") chooseOperator("*");
  if (key === "/") chooseOperator("/");

  if (key === "=" || key === "Enter") {
    evaluate();
    sounds.equals.volume = 0.1;
    playSound('equals');
  };

  if (key === "Backspace") {
    clear();
  }

  if (key === "Escape") {
    playSound('ac');
    currentInput = "";
    operator = null;
    firstOperand = null;
    updateDisplay("0");
    updateDelButton();
  }
});

// Init on load
document.addEventListener('DOMContentLoaded', updateDelButton);
