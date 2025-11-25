// ===== 月間カレンダー生成・表示処理 =====

// --- カレンダー要素 ---
const calendarBody = document.getElementById('calendarBody'); // カレンダー表の tbody
const currentMonthElem = document.getElementById('currentMonth'); // 表示中の年月
const prevMonthBtn = document.getElementById('prevMonth'); // 前月ボタン
const nextMonthBtn = document.getElementById('nextMonth'); // 次月ボタン

// --- 日付操作用変数 ---
let today = new Date();        // 今日の日付
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 0～11

// ==================== カレンダー生成関数 ====================
function renderCalendar(year, month) {
    calendarBody.innerHTML = ''; // 既存カレンダーをクリア

    // --- 月初め・月末の情報 ---
    const firstDay = new Date(year, month, 1); // 月初
    const lastDay = new Date(year, month + 1, 0); // 月末
    const startDay = firstDay.getDay(); // 月初の曜日（日:0～土:6）
    const totalDays = lastDay.getDate(); // 月末の日にち

    // --- 現在の年月表示 ---
    currentMonthElem.textContent = `${year}年 ${month + 1}月`;

    // --- 日付をテーブルに追加 ---
    let date = 1;
    for (let i = 0; i < 6; i++) { // 6行（最大6週）
        const tr = document.createElement('tr');

        for (let j = 0; j < 7; j++) { // 7列（曜日）
            const td = document.createElement('td');

            if (i === 0 && j < startDay) {
                td.textContent = ''; // 空白セル
            } else if (date > totalDays) {
                td.textContent = ''; // 月末後の空白
            } else {
                td.textContent = date;
                td.dataset.date = `${year}-${String(month+1).padStart(2,'0')}-${String(date).padStart(2,'0')}`; // data-date属性にYYYY-MM-DD形式をセット
                td.addEventListener('click', () => {
                    // クリックした日付を取得
                    const selectedDate = td.dataset.date;

                    // モーダルを開く
                    const modal = document.getElementById('calendar-modal');
                    modal.style.display = 'block';

                    // モーダル自体に選択日を保存
                    modal.dataset.selectedDate = selectedDate;

                    // 入力欄リセット
                    document.getElementById('calendar-input-content').value = '';
                    document.getElementById('calendar-input-time').value = '';
                    document.getElementById('calendar-input-note').value = '';
                    document.getElementById('calendar-error-msg').textContent = '';
                });
                td.classList.add('calendar-date'); // 日付セル用クラス
                date++;
            }

            tr.appendChild(td);
        }

        calendarBody.appendChild(tr);
    }
}

// ==================== 前月・次月ボタン処理 ====================
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
});

// ==================== ページ読み込み時にカレンダー表示 ====================
window.addEventListener('load', () => {
    renderCalendar(currentYear, currentMonth);
});

// ===== 日付クリックで学習記録表示処理 =====

// --- 記録表示リスト要素 ---
const dateRecordList = document.getElementById('date-record-list'); // 下部に表示するリスト
const selectedDateElem = document.getElementById('selectedDate');   // 選択日表示

// ==================== 日付クリックイベント ====================
calendarBody.addEventListener('click', (e) => {
    const target = e.target;

    // --- カレンダー日付セルか確認 ---
    if (target.classList.contains('calendar-date')) {
        const selectedDate = target.dataset.date; // YYYY-MM-DD形式
        selectedDateElem.textContent = `選択日: ${selectedDate}`;

        // --- 下部リストをクリア ---
        dateRecordList.innerHTML = '';

        // --- ローカルストレージから読み込み ---
        const records = JSON.parse(localStorage.getItem('learningRecords')) || [];
        const filteredRecords = records.filter(record => {
            // 日付部分のみ比較
            return new Date(record.date).toLocaleDateString() === new Date(selectedDate).toLocaleDateString();
        });

        // --- 記録がある場合リストに反映 ---
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

document.getElementById('calendar-save-record').addEventListener('click', () => {
    const modal = document.getElementById('calendar-modal');
    const selectedDate = modal.dataset.selectedDate;

    const content = document.getElementById('calendar-input-content').value;
    const time = document.getElementById('calendar-input-time').value;
    const note = document.getElementById('calendar-input-note').value;

    if (!content || !time) {
        document.getElementById('calendar-error-msg').textContent = '内容と時間は必須です。';
        return;
    }

    const records = JSON.parse(localStorage.getItem('learningRecords')) || [];
    records.push({
        date: selectedDate,
        content,
        time,
        note
    });

    localStorage.setItem('learningRecords', JSON.stringify(records));

    modal.style.display = 'none';
});

