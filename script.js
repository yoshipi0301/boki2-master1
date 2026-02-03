// ==========================================
//  簿記2級アプリ メインコントローラー (最終版)
// ==========================================

// 1. 各データファイルの読み込み確認と統合
// (ファイルが存在しない場合でもエラーにならず空配列が入るようにしています)
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

// 2. チャプター一覧定義
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

// ==========================================
//  アプリ制御変数
// ==========================================
let currentChapterId = null;
let currentProblemIndex = 0;
let selectedOptionIndex = null;

// ==========================================
//  初期化処理
// ==========================================
window.onload = function() {
    renderChapterList();
};

// チャプターリストの描画
function renderChapterList() {
    const list = document.getElementById('chapter-list');
    if(!list) return;
    
    list.innerHTML = "";
    
    chapters.forEach(chap => {
        // データが存在するかチェック
        const isReady = problemsDB[chap.id] && problemsDB[chap.id].length > 0;
        
        const div = document.createElement('div');
        div.className = "chapter-item";
        
        // バッジの表示 (データがあれば緑、なければグレー)
        let statusBadge = isReady 
            ? `<span class="badge" style="background:var(--success-color);">学習可能</span>` 
            : `<span class="badge" style="background:#bdc3c7;">準備中</span>`;
            
        div.innerHTML = `<span>${chap.title} ${statusBadge}</span> <span>▶</span>`;
        
        // クリックイベント
        div.onclick = () => { 
            if(isReady) {
                startChapter(chap.id); 
            } else {
                alert("データの読み込みに失敗したか、まだファイルが作成されていません。");
            }
        };
        
        list.appendChild(div);
    });
}

// ==========================================
//  問題画面の制御
// ==========================================

// チャプター開始
function startChapter(chapId) {
    currentChapterId = chapId;
    currentProblemIndex = 0;
    showScreen('problem-screen');
    loadProblem();
}

// 問題の読み込みと表示
function loadProblem() {
    const problems = problemsDB[currentChapterId];
    
    // エラーハンドリング
    if(!problems || problems.length === 0) {
        alert("問題データがありません。");
        goHome();
        return;
    }
    
    const problem = problems[currentProblemIndex];
    selectedOptionIndex = null;
    
    // UIのリセット
    document.getElementById('result-section').style.display = 'none';
    const answerBtn = document.getElementById('answer-btn');
    answerBtn.disabled = true;
    answerBtn.style.display = 'block';
    answerBtn.innerText = "回答する";
    
    // 問題文などのセット
    document.getElementById('prob-num').innerText = `Q${currentProblemIndex + 1} / ${problems.length}`;
    document.getElementById('prob-text').innerText = problem.text;
    
    // 選択肢ボタンの生成
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = "";
    
    problem.options.forEach((optText, idx) => {
        const btn = document.createElement('div');
        btn.className = "option-btn";
        btn.innerText = optText;
        btn.onclick = () => selectOption(idx, btn);
        btn.id = `opt-${idx}`;
        optionsArea.appendChild(btn);
    });
}

// 選択肢を選んだ時の処理
function selectOption(idx, btnElement) {
    // 既に回答済みの場合は何もしない
    if(document.getElementById('result-section').style.display === 'block') return;
    
    selectedOptionIndex = idx;
    
    // 見た目の更新
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
    
    // 回答ボタンを有効化
    document.getElementById('answer-btn').disabled = false;
}

// 回答ボタンを押した時の処理
function submitAnswer() {
    const problem = problemsDB[currentChapterId][currentProblemIndex];
    const isCorrect = (selectedOptionIndex === problem.correctIndex);
    
    // ボタンを隠す（または「次へ」に変えるなど、UIはお好みで調整可）
    document.getElementById('answer-btn').style.display = 'none';
    
    // 結果表示エリアを表示
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('main-explanation').innerText = problem.explanation;
    
    // 正解・不正解の色付け
    const correctBtn = document.getElementById(`opt-${problem.correctIndex}`);
    correctBtn.classList.add('correct-highlight');
    // 判定マークの追加
    correctBtn.innerHTML += ' <span style="float:right; font-weight:bold;">⭕ 正解</span>';
    
    if (!isCorrect) {
        const wrongBtn = document.getElementById(`opt-${selectedOptionIndex}`);
        wrongBtn.classList.add('wrong-highlight');
        wrongBtn.innerHTML += ' <span style="float:right; font-weight:bold;">❌</span>';
    }
}

// 「次の問題へ」ボタンの処理
function goNext() {
    if (currentProblemIndex + 1 < problemsDB[currentChapterId].length) {
        currentProblemIndex++;
        loadProblem();
    } else {
        alert("お疲れ様でした！このチャプターの全問題を解き終えました。");
        goHome();
    }
}

// ホーム画面に戻る
function goHome() {
    showScreen('home-screen');
}

// 画面切り替えユーティリティ
function showScreen(id) {
    // 全てのscreenクラスを持つ要素からactive-screenを削除
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    // 指定されたIDの要素にactive-screenを追加
    const target = document.getElementById(id);
    if(target) {
        target.classList.add('active-screen');
    }
}