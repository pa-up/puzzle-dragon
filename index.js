//@ts-check

const moveSound = new Audio('./move.mp3');
const deleteSound = new Audio('./maou_se_magic_wind02.mp3');
const attackSound = new Audio('./magical25.mp3');
const damageSound = new Audio('./damage.mp3');
const winSound = new Audio('./win.mp3');
const gameoverSound = new Audio('./gameover.mp3');

const tickSound = new Audio('./tick.mp3');

//playSound();


function playSound() {
    attackSound.currentTime = 0;
    attackSound.play();
}

let $elemVolume = document.getElementById("volume");
let $elemRange = document.getElementById("vol_range");

//@ts-ignore
$elemVolume.addEventListener("change", function () {
    //@ts-ignore
    setVolume($elemVolume.value);
}, false);

function setVolume(value) {
    //@ts-ignore
    $elemVolume.value = value;
    //@ts-ignore
    $elemRange.textContent = value;

    deleteSound.volume = value;
    attackSound.volume = value;
    damageSound.volume = value;
    winSound.volume = value;
    gameoverSound.volume = value;
    tickSound.volume = value;
}

setVolume(0.05);

const DROP_SIZE = 60;

const ROW_MAX = 6;
const COL_MAX = 6;
const TYPE_MAX = 5;

const DROPS_MARGIN_TOP = 170;
const DROPS_MARGIN_LEFT = 20;

const WIDTH = 380 + DROPS_MARGIN_LEFT;
const HEIGHT = 550;

const INIT_TIME_LIMIT = 10000;

class Drop {
    constructor(row, col) {
        let x = DROP_SIZE * col + DROPS_MARGIN_LEFT;
        let y = DROP_SIZE * row + DROPS_MARGIN_TOP;

        this.X = x;
        this.Y = y;
        this.Type = 0;
        this.colors = ['#f00', '#00f', '#0c0', '#ff0', '#c0c',];
        //轣ｫ�郁ｵ､濶ｲ�峨∵ｰｴ�磯搨濶ｲ�峨∵惠�育ｷ題牡�峨∝��磯ｻ�牡�峨�裸�育ｴｫ濶ｲ�峨�5濶ｲ
        this.Moving = false;
    }

    GetPosition() {
        let col = Math.round((this.X - DROPS_MARGIN_LEFT) / DROP_SIZE);
        let row = Math.round((this.Y - DROPS_MARGIN_TOP) / DROP_SIZE);
        return { Row: row, Col: col };
    }

    Draw() {
        if (this.Moving || this.Y < DROPS_MARGIN_TOP)
            return;
        ctx.fillStyle = this.colors[this.Type];
        ctx.strokeStyle = this.colors[this.Type];
        ctx.beginPath();
        ctx.arc(this.X + DROP_SIZE / 2, this.Y + DROP_SIZE / 2, 30 - 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    IsInside(x, y) {
        if (x < this.X)
            return false;
        if (y < this.Y)
            return false;
        if (x > this.X + DROP_SIZE)
            return false;
        if (y > this.Y + DROP_SIZE)
            return false;

        return true;
    }

    IsInside2(x, y) {
        return this.IsInside(x, y) && !this.IsCorner(x, y);
    }

    IsCorner(x, y) {
        let isLeft = false;
        let isRight = false;
        let isTop = false;
        let isBottom = false;
        if (x < this.X + DROP_SIZE * 0.25)
            isLeft = true;
        if (this.X + DROP_SIZE * 0.75 < x)
            isRight = true;
        if (y < this.Y + DROP_SIZE * 0.25)
            isTop = true;
        if (this.Y + DROP_SIZE * 0.75 < y)
            isBottom = true;

        if (isLeft && isTop)
            return true;
        if (isLeft && isBottom)
            return true;
        if (isRight && isTop)
            return true;
        if (isRight && isBottom)
            return true;

        return false;
    }

    createCopy() {
        let copyDrop = new Drop();
        copyDrop.X = this.X;
        copyDrop.Y = this.Y;
        copyDrop.Type = this.Type;
        return copyDrop;
    }
}

let enemyHP = 1000;
let hp = 1000;

let maxTimeLimit = INIT_TIME_LIMIT;

let stage = 0;
let $enemy = null;
let $enemies = [];

const $enemy1 = new Image();
$enemy1.src = 'img/enemy01.png';
$enemies.push($enemy1);

const $enemy2 = new Image();
$enemy2.src = 'img/enemy02.png';
$enemies.push($enemy2);

const $enemy3 = new Image();
$enemy3.src = 'img/enemy03.png';
$enemies.push($enemy3);

const $enemy4 = new Image();
$enemy4.src = 'img/enemy04.png';
$enemies.push($enemy4);

let ignoreMove = false;
let timeLimit = 0;
let score = 0;

let playing = false;

function init() {
    stage = 0;
    maxTimeLimit = INIT_TIME_LIMIT;
    $enemy = $enemies[stage % $enemies.length];
    enemyHP = 1000;
    hp = 1000;
    ignoreMove = false;
    score = 0;

    tickSound.currentTime = 0;
    tickSound.play();
}

let $can = document.getElementById('can');
let ctx = $can.getContext('2d');

$can.width = WIDTH;
$can.height = HEIGHT;

let $start = document.getElementById('start');


// 逕ｻ髱｢縺ｮ蟾ｦ遶ｯ縺九ｉ縲∬ｦ∫ｴ�縺ｮ蟾ｦ遶ｯ縺ｾ縺ｧ縺ｮ霍晞屬

// 逕ｻ髱｢縺ｮ荳顔ｫｯ縺九ｉ縲∬ｦ∫ｴ�縺ｮ荳顔ｫｯ縺ｾ縺ｧ縺ｮ霍晞屬


function gameStart() {
    playing = true;
    $start.style.display = 'none';

    init();

    timeLimit = maxTimeLimit;
    timerMoveDrops = setInterval(() => {
        timeLimit -= 50;
        if (timeLimit <= 0) {
            clearTimeout(timerMoveDrops);
            finishMoving();
        }
    }, 50);
}


let drops = [];

function initDraps() {
    drops = [];
    for (let row = 0; row < ROW_MAX; row++) {
        for (let col = 0; col < COL_MAX; col++) {
            let x = DROP_SIZE * col;
            let y = DROP_SIZE * row;
            let drop = new Drop(row, col);
            drop.Type = Math.floor(Math.random() * TYPE_MAX);
            drops.push(drop);
        }
    }
}

let movingDrops = [];

function draw() {
}

window.onload = () => {
    init();
    initDraps();
    draw();
}

setInterval(() => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drops.forEach(drop => drop.Draw());
    movingDrops.forEach(drop => drop.Draw());

    ctx.font = '20px �ｭ�ｳ 繧ｴ繧ｷ繝�け bold';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fff';

    ctx.fillStyle = '#fff';
    ctx.fillText(score, 20, 20);

    ctx.fillStyle = '#0ff';
    ctx.fillText('縺ゅ↑縺�', DROPS_MARGIN_LEFT, 50);
    ctx.fillText(hp, DROPS_MARGIN_LEFT, 80);

    ctx.fillStyle = '#f00';
    ctx.fillText('謨ｵ', WIDTH - 60, 50);
    ctx.fillText(enemyHP, WIDTH - 70, 80);

    if ($enemy != null)
        ctx.drawImage($enemy, -20 + (DROPS_MARGIN_LEFT + WIDTH - $enemy1.width) / 2, 30);

    ctx.fillStyle = '#ff0';
    if (timeLimit > 0 && hp > 0)
        ctx.fillText(timeLimit, DROPS_MARGIN_LEFT, 130);
}, 1000 / 60);

let clickedDrop = null;
let timerMoveDrops = null;

$can.addEventListener('mousedown', (ev) => {
    if (ignoreMove || hp <= 0 || !playing)
        return;

    let canvasY = $can.getBoundingClientRect().top;
    let canvasX = $can.getBoundingClientRect().left;
    let x = ev.clientX - canvasX;
    let y = ev.clientY - canvasY;

    let clicked = drops.filter(drop => drop.IsInside(x, y));
    if (clicked.length == 0)
        return;
    clickedDrop = clicked[0];
});

$can.addEventListener('mousemove', (ev) => {
    if (clickedDrop == null || timeLimit <= 0 || !playing)
        return;

    let canvasY = $can.getBoundingClientRect().top;
    let canvasX = $can.getBoundingClientRect().left;
    let x = ev.clientX - canvasX;
    let y = ev.clientY - canvasY;

    let maxX = DROPS_MARGIN_LEFT + DROP_SIZE * COL_MAX;
    let maxY = DROPS_MARGIN_TOP + DROP_SIZE * ROW_MAX;
    if (x < DROPS_MARGIN_LEFT || maxX < x || y < DROPS_MARGIN_TOP || maxY < y) {
        timeLimit = 0;
        clearTimeout(timerMoveDrops);
        finishMoving();
        return;
    }

    let mouseOvered = drops.filter(drop => drop.IsInside2(x, y));
    if (mouseOvered.length == 0 || clickedDrop == mouseOvered[0])
        return;

    swap(clickedDrop, mouseOvered[0]);
});

async function swap(drop1, drop2) {
    let copy1 = drop1.createCopy();
    let copy2 = drop2.createCopy();
    movingDrops.push(copy1);
    movingDrops.push(copy2);

    // 縺吶＄縺ｫ蜈･繧梧崛縺医ｋ
    let oldX = drop1.X;
    let oldY = drop1.Y;

    drop1.X = drop2.X;
    drop1.Y = drop2.Y;

    drop2.X = oldX
    drop2.Y = oldY

    // 繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ縺檎ｵゅｏ繧九∪縺ｧ髱櫁｡ｨ遉ｺ
    drop1.Moving = true;
    drop2.Moving = true;

    // 蝗櫁ｻ｢縺ｮ荳ｭ蠢�
    let centerX = (copy1.X + copy2.X) / 2;
    let centerY = (copy1.Y + copy2.Y) / 2;

    // 蝗櫁ｻ｢縺ｮ蜊雁ｾ�→髢句ｧ九�隗貞ｺｧ讓�
    let r = Math.sqrt(Math.pow(centerX - copy1.X, 2) + Math.pow(centerY - copy1.Y, 2));
    let ang = Math.atan2(copy1.Y - copy2.Y, copy1.X - copy2.X);

    // 繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ髢句ｧ�
    let count = 4;
    for (let i = 0; i < count; i++) {
        await sleep(50);

        let v = Math.PI / count * (i + 1);
        let x1 = r * Math.cos(ang + v) + centerX;
        let y1 = r * Math.sin(ang + v) + centerY;
        copy1.X = x1;
        copy1.Y = y1;

        let x2 = r * Math.cos(ang + Math.PI + v) + centerX;
        let y2 = r * Math.sin(ang + Math.PI + v) + centerY;
        copy2.X = x2;
        copy2.Y = y2;
        draw();
    }
    drop1.Moving = false;
    drop2.Moving = false;

    movingDrops = movingDrops.filter(drop => drop != copy1 && drop != copy2);

    draw();
}

async function sleep(ms) {
    await new Promise(resolve => {
        setTimeout(() => resolve(''), ms);
    })
}

async function finishMoving() {
    timeLimit = 0;

    if (ignoreMove || hp <= 0)
        return;

    console.log('finishMoving()');
    tickSound.pause();

    ignoreMove = true;
    clickedDrop = null;

    let totalComboCount = 0;
    while (true) {
        let comboCount = await checkDrops();
        totalComboCount += comboCount;
        if (comboCount == 0)
            break;
    }

    attackSound.currentTime = 0;
    attackSound.play();

    if (totalComboCount > 0) {
        await sleep(500);
        let add = Math.round(totalComboCount * 70 * Math.pow(1.1, totalComboCount));
        score += add;
        enemyHP -= add;
        if (enemyHP < 0)
            enemyHP = 0;
        draw();
    }

    await enemyAttack();
    await Jude();

    ignoreMove = false;

    if (hp <= 0)
        return;

    tickSound.currentTime = 0;
    tickSound.play();

    timeLimit = maxTimeLimit;
    timerMoveDrops = setInterval(() => {
        timeLimit -= 50;
        if (timeLimit <= 0) {
            clearTimeout(timerMoveDrops);
            finishMoving();
        }
    }, 50);
}

async function enemyAttack() {
    if (enemyHP > 0) {
        await sleep(1000);

        damageSound.currentTime = 0;
        damageSound.play();

        hp -= Math.floor(Math.random() * 300);
        if (hp < 0)
            hp = 0;
        draw();
    }
}

async function Jude() {
    if (enemyHP <= 0) {
        $enemy = null;

        winSound.currentTime = 0;
        winSound.play();

        draw();

        await sleep(2000);

        stage++;
        $enemy = $enemies[stage % $enemies.length];
        enemyHP = 1000;
        hp = 1000;
        if (maxTimeLimit > 7999)
            maxTimeLimit -= 2000;
        else if (maxTimeLimit > 3999)
            maxTimeLimit -= 1000;
        else
            maxTimeLimit -= 500;
        if (maxTimeLimit < 800)
            maxTimeLimit = 800;
        draw();
    }
    if (hp <= 0) {
        await sleep(1000);
        gameoverSound.currentTime = 0;
        gameoverSound.play();
        playing = false;
        $start.style.display = 'block';
    }
}

$can.addEventListener('mouseup', async (ev) => {
    if (clickedDrop == null || !playing)
        return;

    await finishMoving();
});


function createDropsMap() {
    let dropMap = [];
    for (let row = 0; row < ROW_MAX; row++) {
        dropMap[row] = [];

        for (let col = 0; col < COL_MAX; col++) {
            dropMap[row][col] = null;
        }
    }

    for (let i = 0; i < drops.length; i++) {
        let pos = drops[i].GetPosition();
        dropMap[pos.Row][pos.Col] = drops[i];
    }
    return dropMap;
}

function createCheckMap() {
    let checkMap = [];
    for (let row = 0; row < ROW_MAX; row++) {
        checkMap[row] = [];

        for (let col = 0; col < COL_MAX; col++)
            checkMap[row][col] = false;
    }
    return checkMap;
}

async function deleteDrops() {
    let dropMap = createDropsMap();
    let comboCount = 0;
    let hCheckMap = createCheckMap();
    let vCheckMap = createCheckMap();

    // 繝峨Ο繝��繧呈ｶ医☆
    for (let row = 0; row < ROW_MAX; row++) {
        for (let col = 0; col < COL_MAX; col++) {
            let type = dropMap[row][col].Type;
            let deleteDropsList = [];

            //				hCheckMap
            if (!hCheckMap[row][col]) {
                let arr = [];
                for (let i = 0; col + i < COL_MAX; i++) {
                    if (type == dropMap[row][col + i].Type) {
                        arr.push(dropMap[row][col + i]);
                        hCheckMap[row][col + i] = true;
                    }
                    else
                        break;
                }
                if (arr.length >= 3)
                    deleteDropsList.push(arr);
            }

            if (!vCheckMap[row][col]) {
                let arr = [];
                for (let i = 0; row + i < ROW_MAX; i++) {
                    if (type == dropMap[row + i][col].Type) {
                        arr.push(dropMap[row + i][col]);
                        vCheckMap[row + i][col] = true;
                    }
                    else
                        break;
                }
                if (arr.length >= 3)
                    deleteDropsList.push(arr);
            }

            comboCount += deleteDropsList.length;

            for (let i = 0; i < deleteDropsList.length; i++) {
                await sleep(500);
                for (let k = 0; k < deleteDropsList[i].length; k++)
                    drops = drops.filter(drop => deleteDropsList[i][k] != drop);
                draw();
                deleteSound.currentTime = 0;
                deleteSound.play();
            }
        }
    }
    return comboCount;
}

async function downDrops() {
    // 豸医∴縺溘ラ繝ｭ繝��繧定ｩｰ繧√ｋ
    let dropMap = createDropsMap();

    while (true) {
        let downDrops = [];
        for (let row = ROW_MAX - 1; row >= 0; row--) {
            for (let col = 0; col < COL_MAX; col++) {
                if (dropMap[row][col] == null && row > 0) {
                    if (dropMap[row - 1][col] != null)
                        downDrops.push(dropMap[row - 1][col]);

                    dropMap[row][col] = dropMap[row - 1][col];
                    dropMap[row - 1][col] = null;
                }
                else if (dropMap[row][col] == null && row == 0) {
                    let newDrop = new Drop(-1, col);
                    newDrop.Type = Math.floor(Math.random() * TYPE_MAX);
                    downDrops.push(newDrop);
                    drops.push(newDrop);
                    dropMap[row][col] = newDrop;
                }
            }
        }

        for (let i = 0; i < 4; i++) {
            await sleep(50);
            downDrops.forEach(drop => drop.Y += DROP_SIZE / 4);
        }
        if (downDrops.length == 0)
            break;
    }
}

async function checkDrops() {

    let comboCount = await deleteDrops();
    await downDrops();

    return comboCount;
}
