// ==========================================
//  簿記2級アプリ メインコントローラー (最終完全版)
// ==========================================

// データの読み込み (存在チェック付き)
const problemsDB = {
    1: typeof data_ch1 !== 'undefined' ? data_ch1 : [],
    2: typeof data_ch2 !== 'undefined' ? data_ch2 : [],
    3: typeof data_ch3 !== 'undefined' ? data_ch3 : [],
    4: typeof data_ch4 !== 'undefined' ? data_ch4 : [],
    5: typeof data_ch5 !== 'undefined' ? data_ch5 : [],
    6: typeof data_ch6 !== 'undefined' ? data_ch6 : [],
    7: typeof data_ch7 !== 'undefined' ? data_ch7 : [],
    8: typeof data_ch8 !== 'undefined' ? data_ch8 : [],
    9: typeof data_ch9 !== 'undefined' ? data_ch9 : [],
    10: typeof data_ch10 !== 'undefined' ? data_ch10 : [],
    11: typeof data_ch11 !== 'undefined' ? data_ch11 : [],
    12: typeof data_ch12 !== 'undefined' ? data_ch12 : [],
    13: typeof data_ch13 !== 'undefined' ? data_ch13 : [],
    14: typeof data_ch14 !== 'undefined' ? data_ch14 : [],
    15: typeof data_ch15 !== 'undefined' ? data_ch15 : []
};

const chapters = [
    { id: 1, title: "Chapter 1: 商品売買" },
    { id: 2, title: "Chapter 2: 現金預金" },
    { id: 3, title: "Chapter 3: 手形・電子記録債権" },
    { id: 4, title: "Chapter 4: 有価証券" },
    { id: 5, title: "Chapter 5: その他の債権・債務" },
    { id: 6, title: "Chapter 6: 固定資産" },
    { id: 7, title: "Chapter 7: リース取引" },
    { id: 8, title: "Chapter 8: 外貨建取引" },
    { id: 9, title: "Chapter 9: 税金" },
    { id: 10, title: "Chapter 10: 引当金" },
    { id: 11, title: "Chapter 11: 決算・財務諸表" },
    { id: 12, title: "Chapter 12: 本支店会計" },
    { id: 13, title: "Chapter 13: 連結会計 (基本)" },
    { id: 14, title: "Chapter 14: 連結会計 (応用)" },
    { id: 15, title: "Chapter 15: 製造業会計・模試" }
];

// 制御変数
let currentChapterId = null;
let currentProblemIndex = 0;
let selectedOptionIndex = null;
let isReviewMode = false;

// LocalStorageキー
const LS_KEY = 'boki2_wrong_list';

// 初期化
window.onload = function() {
    renderChapterList();
    updateReviewButton();
};

// ==========================================
//  ユーティリティ：配列シャッフル
// ==========================================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ==========================================
//  復習機能（LocalStorage操作）
// ==========================================
function saveWrongAnswer(chapId, probIndex) {
    let list = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    const exists = list.some(item => item.c === chapId && item.i === probIndex);
    if (!exists) {
        list.push({ c: chapId, i: probIndex, date: new Date().getTime() });
        localStorage.setItem(LS_KEY, JSON.stringify(list));
        updateReviewButton();
    }
}

function removeWrongAnswer(chapId, probIndex) {
    let list = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    const newList = list.filter(item => !(item.c === chapId && item.i === probIndex));
    localStorage.setItem(LS_KEY, JSON.stringify(newList));
    updateReviewButton();
}

function updateReviewButton() {
    let list = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    const btn = document.getElementById('review-mode-btn');
    if(btn) {
        btn.innerText = `🔥 復習モード (${list.length}問)`;
        btn.style.backgroundColor = list.length > 0 ? '#e67e22' : '#bdc3c7';
        btn.disabled = list.length === 0;
    }
}

// ==========================================
//  画面制御
// ==========================================
function renderChapterList() {
    const list = document.getElementById('chapter-list');
    if(!list) return;
    list.innerHTML = "";
    chapters.forEach(chap => {
        const isReady = problemsDB[chap.id] && problemsDB[chap.id].length > 0;
        const div = document.createElement('div');
        div.className = "chapter-item";
        let statusBadge = isReady 
            ? `<span class="badge" style="background:var(--success-color);">学習可能</span>` 
            : `<span class="badge" style="background:#bdc3c7;">準備中</span>`;
        div.innerHTML = `<span>${chap.title} ${statusBadge}</span> <span>▶</span>`;
        div.onclick = () => { if(isReady) startChapter(chap.id); };
        list.appendChild(div);
    });
}

function openReviewScreen() {
    const list = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    if(list.length === 0) return;

    showScreen('review-screen');
    const container = document.getElementById('review-list');
    container.innerHTML = "";

    list.forEach((item) => {
        const prob = problemsDB[item.c][item.i];
        const chapTitle = chapters.find(c => c.id === item.c).title;
        const div = document.createElement('div');
        div.className = "review-item";
        const preview = prob.text.split('\n')[0].substring(0, 40) + "...";
        div.innerHTML = `
            <span class="review-chapter-tag">${chapTitle}</span>
            <span class="review-text-preview">${preview}</span>
        `;
        div.onclick = () => startReviewProblem(item.c, item.i);
        container.appendChild(div);
    });
}

function startChapter(chapId) {
    isReviewMode = false;
    currentChapterId = chapId;
    currentProblemIndex = 0;
    showScreen('problem-screen');
    loadProblem();
}

function startReviewProblem(chapId, probIndex) {
    isReviewMode = true;
    currentChapterId = chapId;
    currentProblemIndex = probIndex;
    showScreen('problem-screen');
    loadProblem();
}

// 問題の読み込みと表示（シャッフルロジック含む）
function loadProblem() {
    const problems = problemsDB[currentChapterId];
    const problem = problems[currentProblemIndex];
    selectedOptionIndex = null;
    
    document.getElementById('result-section').style.display = 'none';
    const answerBtn = document.getElementById('answer-btn');
    answerBtn.disabled = true;
    answerBtn.style.display = 'block';
    
    if (isReviewMode) {
        document.getElementById('prob-num').innerText = "🔥 復習中";
        document.getElementById('prob-chapter').innerText = "苦手を克服しよう！";
    } else {
        document.getElementById('prob-num').innerText = `Q${currentProblemIndex + 1} / ${problems.length}`;
        const chap = chapters.find(c => c.id === currentChapterId);
        document.getElementById('prob-chapter').innerText = chap ? chap.title : "";
    }

    document.getElementById('prob-text').innerText = problem.text;
    
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = "";

    // 選択肢に「元の番号」を付与してシャッフル
    const indexedOptions = problem.options.map((opt, index) => ({ 
        text: opt, 
        originalIndex: index 
    }));

    shuffleArray(indexedOptions);

    indexedOptions.forEach((optObj) => {
        const btn = document.createElement('div');
        btn.className = "option-btn";
        btn.innerText = optObj.text;
        
        // クリック時に「元の番号」を渡す
        btn.onclick = () => selectOption(optObj.originalIndex, btn);
        // IDに「元の番号」を含める
        btn.id = `opt-orig-${optObj.originalIndex}`;
        
        optionsArea.appendChild(btn);
    });
}

function selectOption(originalIndex, btnElement) {
    if(document.getElementById('result-section').style.display === 'block') return;
    
    selectedOptionIndex = originalIndex;
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
    document.getElementById('answer-btn').disabled = false;
}

function submitAnswer() {
    const problem = problemsDB[currentChapterId][currentProblemIndex];
    // 正誤判定
    const isCorrect = (selectedOptionIndex === problem.correctIndex);
    
    document.getElementById('answer-btn').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('main-explanation').innerText = problem.explanation;
    
    // 正解のボタンを緑にする
    const correctBtn = document.getElementById(`opt-orig-${problem.correctIndex}`);
    if(correctBtn) {
        correctBtn.classList.add('correct-highlight');
        correctBtn.innerHTML += ' <span style="float:right; font-weight:bold;">⭕ 正解</span>';
    }
    
    if (!isCorrect) {
        // 間違えたボタンを赤にする
        const wrongBtn = document.getElementById(`opt-orig-${selectedOptionIndex}`);
        if(wrongBtn) {
            wrongBtn.classList.add('wrong-highlight');
            wrongBtn.innerHTML += ' <span style="float:right; font-weight:bold;">❌</span>';
        }
        // 間違いリストに追加
        saveWrongAnswer(currentChapterId, currentProblemIndex);
    } else {
        // 復習モードで正解ならリストから削除
        if (isReviewMode) {
            removeWrongAnswer(currentChapterId, currentProblemIndex);
            alert("ナイス！苦手リストから削除しました🎉");
        }
    }
    
    const nextBtn = document.querySelector('.next-btn');
    if (isReviewMode) {
        nextBtn.innerText = "復習リストへ戻る";
        nextBtn.onclick = openReviewScreen;
    } else {
        nextBtn.innerText = "次へ";
        nextBtn.onclick = goNext;
    }
}

function goNext() {
    if (currentProblemIndex + 1 < problemsDB[currentChapterId].length) {
        currentProblemIndex++;
        loadProblem();
    } else {
        alert("チャプター完了！お疲れ様でした。");
        goHome();
    }
}

function goHome() {
    updateReviewButton();
    showScreen('home-screen');
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    document.getElementById(id).classList.add('active-screen');
    window.scrollTo(0, 0);
}
