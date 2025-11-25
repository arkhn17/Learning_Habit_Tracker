// ===== 学習記録モーダルの動作・保存処理 =====

// --- モーダル要素 ---
const modal = document.getElementById('modal'); // モーダル全体
const openModalBtn = document.getElementById('open-modal'); // 「学習を記録」ボタン
const closeModalBtn = document.getElementById('close-modal'); // モーダルの「×」ボタン

// --- 入力要素 ---
const inputContent = document.getElementById('input-content'); // 学習内容入力欄
const inputTime = document.getElementById('input-time');       // 所要時間入力欄
const inputNote = document.getElementById('input-note');       // 気付き／感想入力欄
const saveBtn = document.getElementById('save-record');        // 保存ボタン
const errorMsg = document.getElementById('error-msg');         // エラーメッセージ表示

// --- 記録表示リスト ---
const recordList = document.getElementById('record-list');

// ==================== モーダル操作 ====================

// モーダル表示
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block'; // モーダルを表示
    clearInputs();                 // 入力欄をリセット
});

// モーダル非表示（×ボタン）
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    clearInputs();
});

// モーダル外クリックで閉じる
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        clearInputs();
    }
});

// 入力欄とエラー表示をリセットする関数
function clearInputs() {
    inputContent.value = '';
    inputTime.value = '';
    inputNote.value = '';
    errorMsg.textContent = '';
}

// ==================== 保存処理 ====================

saveBtn.addEventListener('click', () => {
    const content = inputContent.value.trim(); // 学習内容
    const time = parseInt(inputTime.value);    // 所要時間（数値）
    const note = inputNote.value.trim();       // 気付き／感想（任意）

    // --- 入力チェック ---
    if (!content || isNaN(time) || time <= 0) {
        errorMsg.textContent = '学習内容と正しい時間を入力してください。';
        return; // ここで処理中断
    }

    // --- 記録オブジェクト作成 ---
    const record = {
        content: content,
        time: time,
        note: note,
        date: new Date().toISOString() // 登録日時（ISO形式）
    };

    // --- ローカルストレージに保存 ---
    let records = JSON.parse(localStorage.getItem('learningRecords')) || [];
    records.push(record);
    localStorage.setItem('learningRecords', JSON.stringify(records));

    // --- 記録リストに反映 ---
    addRecordToList(record);

    // --- モーダル閉じる ---
    modal.style.display = 'none';
    clearInputs();
});

// ==================== 記録表示 ====================

function addRecordToList(record) {
    const li = document.createElement('li');
    // 表示形式: YYYY-MM-DD: 内容 (時間分) - 気付き（任意）
    const dateStr = new Date(record.date).toLocaleDateString(); // 日付のみ表示
    li.textContent = `${dateStr}: ${record.content} (${record.time}分) ${record.note ? "- " + record.note : ""}`;
    recordList.appendChild(li);
}

// ==================== ページ読み込み時にローカルストレージから読み込み ====================
window.addEventListener('load', () => {
    const records = JSON.parse(localStorage.getItem('learningRecords')) || [];
    records.forEach(record => addRecordToList(record));
});