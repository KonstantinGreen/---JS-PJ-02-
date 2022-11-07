const TICKER_FREQUENCY = 100;
const KEYSTROKE_TRESHOLD = 50;
const DIRECTIONS = {
  UP: "UP",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  LEFT: "LEFT"
};

const BLOCK_SIZE = 40;
const BABY_SNAKE_LENGTH = 2;
const HORIZONTAL_BLOCKS = 10;
const VERTICAL_BLOCKS = 10;
const ARENA_WIDTH = HORIZONTAL_BLOCKS * BLOCK_SIZE;
const ARENA_HEIGHT = VERTICAL_BLOCKS * BLOCK_SIZE;
const COLOURS = {
  ARENA_BG: "#008000",
  ARENA_BORDER: "#543D3A",
  SNAKE_HEAD: "#D21855",
  SNAKE_BODY: "#A00034",
  FOOD: "#6A6C3C"
};
let snake = [];
let food = [];
let score = 0;
let record = 0;
let direction = undefined;
let tick = undefined;
let hasUserPlayed = false;
let cachedKeyStrokeTime = 0;

const arena = document.querySelector("#arena");
const scoreSpan = document.querySelector("#score");
const startButton = document.querySelector("#start-button");
const recordsBlock = document.querySelector("#records");
const canvas = document.createElement("canvas");
canvas.style.border = `3px solid ${COLOURS.ARENA_BORDER}`;
canvas.width = ARENA_WIDTH;
canvas.height = ARENA_HEIGHT;
canvas.style.width = canvas.width;
canvas.style.height = canvas.height;
arena.appendChild(canvas);
const context = canvas.getContext("2d");

const isSnakeEating = () => {
  return !!(snake[0].x === food.x && snake[0].y === food.y);
};

const isSnakeCrashing = () => {
  const headlessSnake = snake.slice(1, snake.length);
  const snakeHead = snake[0];
  let isCrashing = false;

  switch (direction) {
    case DIRECTIONS.LEFT:
      isCrashing = !!headlessSnake.find(
        (block) => snakeHead.x === block.x + 1 && snakeHead.y === block.y
      );
      break;
    case DIRECTIONS.RIGHT:
      isCrashing = !!headlessSnake.find(
        (block) => snakeHead.x === block.x - 1 && snakeHead.y === block.y
      );
      break;
    case DIRECTIONS.UP:
      isCrashing = !!headlessSnake.find(
        (block) => snakeHead.x === block.x && snakeHead.y === block.y + 1
      );
      break;
    default:
      isCrashing = !!headlessSnake.find(
        (block) => snakeHead.x === block.x && snakeHead.y === block.y - 1
      );
      break;
  }

  return isCrashing;
};

const updateSnake = () => {
  const currentHeadPos = snake[0];
  let nextHeadPos = currentHeadPos;
  let callGameOver = false;

  switch (direction) {
    case DIRECTIONS.LEFT:
      if (currentHeadPos.x > 0) {
        nextHeadPos = { x: currentHeadPos.x - 1, y: currentHeadPos.y };
      } else {
        callGameOver = true;
      }
      break;
    case DIRECTIONS.UP:
      if (currentHeadPos.y > 0) {
        nextHeadPos = { x: currentHeadPos.x, y: currentHeadPos.y - 1 };
      } else {
        callGameOver = true;
      }
      break;
    case DIRECTIONS.DOWN:
      if (currentHeadPos.y < VERTICAL_BLOCKS - 1) {
        nextHeadPos = { x: currentHeadPos.x, y: currentHeadPos.y + 1 };
      } else {
        callGameOver = true;
      }
      break;
    default:
      if (currentHeadPos.x < HORIZONTAL_BLOCKS - 1) {
        nextHeadPos = { x: currentHeadPos.x + 1, y: currentHeadPos.y };
      } else {
        callGameOver = true;
      }
      break;
  }

  if (isSnakeCrashing()) {
    callGameOver = true;
  }

  if (isSnakeEating()) {
    score++;
  }

  if (callGameOver) {
    gameOver();
    return snake;
  }

  let updatedSnake = [nextHeadPos];
  for (let i = 1; i < snake.length; i++) {
    updatedSnake[i] = snake[i - 1];
  }

  if (isSnakeEating()) {
    updatedSnake.push(snake[snake.length - 1]);
    food = makeFood();
  }

  return updatedSnake;
};

const handleKeyboard = (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
   return; 
  }
  
  const lastKeyStrokeTime = new Date().getTime();
  if (lastKeyStrokeTime - cachedKeyStrokeTime < KEYSTROKE_TRESHOLD) {
    return;
  }
  cachedKeyStrokeTime = lastKeyStrokeTime;
  
  switch (e.code) {
    case "ArrowUp":
    case "KeyW":
      if (direction !== DIRECTIONS.DOWN) {
        direction = DIRECTIONS.UP;
      }
      break;
    case "ArrowDown":
    case "KeyS":
      if (direction !== DIRECTIONS.UP) {
        direction = DIRECTIONS.DOWN;
      }
      break;
    case "ArrowRight":
    case "KeyD":
      if (direction !== DIRECTIONS.LEFT) {
        direction = DIRECTIONS.RIGHT;
      }
      break;
    case "ArrowLeft":
    case "KeyA":
      if (direction !== DIRECTIONS.RIGHT) {
        direction = DIRECTIONS.LEFT;
      }
      break;
    default:
      break;
  }
};

const initProps = (needToMakeFood = true) => {
  const headPosX = Math.ceil(HORIZONTAL_BLOCKS * 0.5);
  const headPosY = Math.ceil(VERTICAL_BLOCKS * 0.5);

  snake = [];
  for (let i = 0; i < BABY_SNAKE_LENGTH; i++) {
    snake.push({ x: headPosX - i, y: headPosY });
  }
  if (needToMakeFood) {
    food = makeFood();
  }
  score = 0;
  cachedKeyStrokeTime = 0;
  direction = DIRECTIONS.RIGHT;
  tick = undefined;
};

const startGame = () => {
  startButton.setAttribute("hidden", "true");
  resetGame(!!hasUserPlayed);
  tick = setInterval(onTick, TICKER_FREQUENCY);
  document.addEventListener("keydown", handleKeyboard);
  hasUserPlayed = true;
};

const resetGame = (needToMakeFood = true) => {
  resetTicker();
  initProps(needToMakeFood);
  scoreSpan.innerHTML = `0`;
};

const gameOver = () => {
  document.removeEventListener("keydown", handleKeyboard);
  resetTicker();

  let snakeVisibilityCounter = 0;
  const gameOverInterval = setInterval(() => {
    if (snakeVisibilityCounter < 6) {
      drawGraphics(snakeVisibilityCounter % 2 !== 0);
      snakeVisibilityCounter++;
    } else {
      clearInterval(gameOverInterval);
      startButton.removeAttribute("hidden");
      startButton.focus();
    }
  }, 200);
};

const resetTicker = () => {
  if (typeof tick !== "undefind") {
    clearInterval(tick);
    tick = undefined;
  }
};
const makeFood = () => {
  const foodMap = [];
  for (let i = 0; i < HORIZONTAL_BLOCKS; i++) {
    for (let j = 0; j < VERTICAL_BLOCKS; j++) {
      if (!snake.find((block) => block.x === i && block.y === j)) {
        foodMap.push({ x: i, y: j });
      }
    }
  }
  return foodMap[Math.round(Math.random() * foodMap.length - 1)];
};

const onTick = () => {
  snake = updateSnake();
  drawGraphics();
  scoreSpan.innerHTML = score;
  if (score > record) {
    record = score;
    recordsBlock.innerText = record;
  }
};

const drawGraphics = (showSnake = true) => {
  drawBackground();
  if (showSnake) {
    drawSnake();
  }
  drawFood();
};

const drawBackground = () => {
  const canvasWidth = context.canvas.clientWidth;
  const canvasHeight = context.canvas.clientHeight;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = COLOURS.ARENA_BG;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.restore();
};

const drawFood = () => {
  const foodBlockSize = BLOCK_SIZE * 0.333333;
  context.fillStyle = COLOURS.SNAKE_HEAD;
  context.fillRect(
    food.x * BLOCK_SIZE + foodBlockSize,
    food.y * BLOCK_SIZE,
    foodBlockSize,
    foodBlockSize
  );
  context.fillRect(
    food.x * BLOCK_SIZE,
    food.y * BLOCK_SIZE + foodBlockSize,
    foodBlockSize,
    foodBlockSize
  );
  context.fillRect(
    food.x * BLOCK_SIZE + foodBlockSize * 2,
    food.y * BLOCK_SIZE + foodBlockSize,
    foodBlockSize,
    foodBlockSize
  );
  context.fillRect(
    food.x * BLOCK_SIZE + foodBlockSize,
    food.y * BLOCK_SIZE + foodBlockSize * 2,
    foodBlockSize,
    foodBlockSize
  );
  context.restore();
};

const drawSnake = () => {
  context.fillStyle = COLOURS.SNAKE_BODY;
  snake.map((block) => {
    context.fillRect(
      block.x * BLOCK_SIZE,
      block.y * BLOCK_SIZE,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
  });
  context.fillStyle = COLOURS.SNAKE_HEAD;
  context.fillRect(
    snake[0].x * BLOCK_SIZE,
    snake[0].y * BLOCK_SIZE,
    BLOCK_SIZE,
    BLOCK_SIZE
  );
  context.restore();
};

resetGame(true);
drawGraphics();
startButton.addEventListener("click", startGame);
