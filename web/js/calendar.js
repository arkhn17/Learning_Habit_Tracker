// ===== 月間カレンダー生成・表示処理 =====

// --- カレンダー要素 ---
const calendarBody = document.getElementById('calendarBody'); // カレンダー表(tbody要素)を取得
const currentMonthElem = document.getElementById('currentMonth'); // 現在の年月を表示
const prevMonthBtn = document.getElementById('prevMonth'); // 前月ボタン
const nextMonthBtn = document.getElementById('nextMonth'); // 次月ボタン

// --- 日付操作用変数 ---
let today = new Date();        // 今日の日時オブジェクト
let currentYear = today.getFullYear(); // 現在の年
let currentMonth = today.getMonth(); // 現在の月(0～11)

// ==================== カレンダー生成関数 ====================
// 指定されたyearとmonth(0〜11)を元にカレンダーを生成して表示
function renderCalendar(year, month) {
    calendarBody.innerHTML = ''; // 既存カレンダー（古いセル）をクリア

    // --- 月初と月末を取得 ---
    const firstDay = new Date(year, month, 1); // 月初
    const lastDay = new Date(year, month + 1, 0); // 月末
    const startDay = firstDay.getDay(); // 月初の曜日番号（日:0～土:6）
    const totalDays = lastDay.getDate(); // 月の日数

    // --- 現在の年月を表示 ---
    currentMonthElem.textContent = `${year}年 ${month + 1}月`;

    let date = 1; // カレンダー上に入れる日付カウンター

    for (let i = 0; i < 6; i++) { // 最大6行
        const tr = document.createElement('tr');

        for (let j = 0; j < 7; j++) { // 7列（週7日分）
            const td = document.createElement('td');

            // --- 1日より前、月末より後を空欄にする ---
            if (i === 0 && j < startDay) {
                td.textContent = ''; // 月初まで空欄セル
            } else if (date > totalDays) {
                td.textContent = ''; // 月末から空欄セル
            } else {
                // --- 日付をセルにセット ---
                td.textContent = date;
                td.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(date).padStart(2,'0')}`; // data-date属性にYYYY-MM-DD形式をセット
                // 日付セルがクリックされた時の動作を定義
                td.addEventListener('click', () => {
                    const selectedDate = td.dataset.date; // クリックした日付を取得

                    const modal = document.getElementById('calendar-modal'); // モーダルを取得
                    modal.style.display = 'block'; // モーダルを表示

                    // モーダル内部に選択した日付を保存
                    modal.dataset.selectedDate = selectedDate

                    // 入力フォームを初期化
                    document.getElementById('calendar-input-content').value = '';
                    document.getElementById('calendar-input-time').value = '';
                    document.getElementById('calendar-input-note').value = '';
                    document.getElementById('calendar-error-msg').textContent = '';
                    
                });

                td.classList.add('calendar-date'); // 見た目を調整するためのクラス付与
                date++; // 次の日へ
            }

            tr.appendChild(td); // セルを行に追加
        }

        calendarBody.appendChild(tr); // 完成した行を表に追加
    }
}

// ==================== 月移動ボタン処理 ====================
// 前月ボタン（◀）クリック「月をひとつ戻す」
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
});

// 翌月ボタン（▶）クリック「月をひとつ進める」
nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
});

// ===== ページ読み込み時に現在月のカレンダーを表示 =====
window.addEventListener('load', () => {
    renderCalendar(currentYear, currentMonth);
});

// ===== 日付クリックで学習記録表示処理 =====

// --- 表示欄要素 ---
const dateRecordList = document.getElementById('date-record-list'); // 選択した日の記録を下部にリストで表示
const selectedDateElem = document.getElementById('selectedDate');   // 選択した日付の表示領域

// カレンダー全体にイベント委譲
calendarBody.addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('calendar-date')) { // 日付セルのみ反応
        const selectedDate = target.dataset.date; // 選択された日付を取得（YYYY-MM-DD形式） 
        selectedDateElem.textContent = `選択日: ${selectedDate}`;

        dateRecordList.innerHTML = ''; // 過去表示をリセット

        const records = JSON.parse(localStorage.getItem('learningRecords')) || []; // ローカルストレージから保存済みの学習記録を取得

        // 選択した日付と一致するデータだけを抽出
        const filteredRecords = records.filter(record => {
            return new Date(record.date).toLocaleDateString() === new Date(selectedDate).toLocaleDateString();
        });

        // 記録がある場合 → リスト表示 / ない場合 → メッセージ表示
        if (filteredRecords.length > 0) {
            filteredRecords.forEach(record => {
                const li = document.createElement('li');
                li.textContent = `${record.content} (${record.time}分) ${record.note ? "- " + record.note : ""}`;
                dateRecordList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'この日に学習記録はありません。';
            dateRecordList.appendChild(li);
        }
    }
});

// ===== モーダルで入力した学習内容を保存 =====
document.getElementById('calendar-save-record').addEventListener('click', () => {
    const modal = document.getElementById('calendar-modal');
    const selectedDate = modal.dataset.selectedDate; // モーダルに保存しておいた選択日を取得

    // 入力内容取得
    const content = document.getElementById('calendar-input-content').value;
    const time = document.getElementById('calendar-input-time').value;
    const note = document.getElementById('calendar-input-note').value;

    // 必須項目チェック
    if (!content || !time) {
        document.getElementById('calendar-error-msg').textContent = '内容と時間は必須です。';
        return;
    }

    // 既存データ取得（なければ空配列）
    const records = JSON.parse(localStorage.getItem('learningRecords')) || [];
    
    // 新しい記録を追加
    records.push({
        date: selectedDate,
        content,
        time,
        note
    });

    // 変更を保存
    localStorage.setItem('learningRecords', JSON.stringify(records));

    // モーダルを閉じる
    modal.style.display = 'none';
});

