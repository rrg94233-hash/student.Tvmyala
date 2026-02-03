// script.js

const loginForm = document.getElementById('loginForm');
const studentInput = document.getElementById('studentId');
const userList = document.getElementById('userList');

// 1. ฟังก์ชันบังคับให้พิมพ์เฉพาะตัวเลขและจำกัดแค่ 5 หลัก
if (studentInput) {
    studentInput.addEventListener('input', function(e) {
        // กรองเอาตัวที่ไม่ใช่ตัวเลขออก และตัดให้เหลือไม่เกิน 5 ตัว
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 5);
    });
}

// 2. ฟังก์ชันส่งข้อมูลไป Google Sheets
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรชเอง
    
    const id = studentInput.value;
    const time = new Date().toLocaleString('th-TH');

    // ตรวจสอบความถูกต้อง: ต้องมี 5 หลักพอดี (แก้ไขจากจุดที่ผิดในภาพเดิม)
    if (id.length !== 5) {
        alert("❌ กรุณากรอกรหัสประจำตัวให้ครบ 5 หลัก!");
        return; 
    }

    // --- ส่วนเชื่อมต่อ Google Sheets ---
    // ก๊อปปี้ URL ที่ได้จากขั้นตอน Deploy ใน Google Apps Script มาวางที่นี่
    const scriptURL = 'ใส่_URL_ของ_Google_Apps_Script_ตรงนี้';

    // แสดงสถานะกำลังส่งข้อมูล
    const btn = document.querySelector('.btn-signin');
    btn.innerText = 'กำลังส่งข้อมูล...';
    btn.disabled = true;

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // เพื่อป้องกันปัญหา CORS เบื้องต้น
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, time: time })
    })
    .then(() => {
        alert("✅ บันทึกข้อมูลรหัส " + id + " ลง Google Sheets สำเร็จ!");
        
        // บันทึกไว้ดูในเครื่องควบคู่ไปด้วย (LocalStorage)
        saveToLocal(id, time);
        
        loginForm.reset();
    })
    .catch(error => {
        console.error('Error!', error.message);
        alert("❌ เกิดข้อผิดพลาดในการส่งข้อมูล");
    })
    .finally(() => {
        btn.innerText = '➜ SIGN IN';
        btn.disabled = false;
    });
});

// 3. ฟังก์ชันบันทึกสำรองในเครื่อง (เพื่อให้รายชื่อโชว์ใต้กล่องเหมือนเดิม)
function saveToLocal(id, time) {
    let users = JSON.parse(localStorage.getItem('tvm_data')) || [];
    users.unshift({ id, time });
    if (users.length > 30) users.pop(); // เก็บแค่ 30 คนล่าสุด
    localStorage.setItem('tvm_data', JSON.stringify(users));
    displayUsers();
}

// 4. ฟังก์ชันดึงข้อมูลจากเครื่องมาแสดงโชว์ใต้กล่อง
function displayUsers() {
    const users = JSON.parse(localStorage.getItem('tvm_data')) || [];
    if (!userList) return;
    
    userList.innerHTML = ''; 
    users.forEach(user => {
        const li = document.createElement('li');
        li.style.padding = "8px 0";
        li.style.borderBottom = "1px solid #eee";
        li.style.listStyle = "none";
        li.style.fontSize = "13px";
        li.textContent = `ID: ${user.id} — บันทึกเมื่อ: ${user.time}`;
        userList.appendChild(li);
    });
}

// 5. ฟังก์ชันล้างข้อมูลในหน้าจอ
function clearData() {
    if(confirm('ล้างรายชื่อที่แสดงบนหน้าจอนี้? (ข้อมูลใน Google Sheets จะไม่หาย)')) {
        localStorage.removeItem('tvm_data');
        displayUsers();
    }
}

// เรียกใช้งานเพื่อให้รายชื่อแสดงทันทีที่โหลดหน้า
displayUsers();