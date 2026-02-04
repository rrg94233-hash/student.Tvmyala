const loginForm = document.getElementById('loginForm');
const userList = document.getElementById('userList');
const studentInput = document.getElementById('studentId');

// 1. รับเฉพาะตัวเลข
if (studentInput) {
    studentInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// 2. แสดงประวัติในหน้าเว็บ
function displayUsers() {
    const users = JSON.parse(localStorage.getItem('tvm_data')) || [];
    if (!userList) return;
    userList.innerHTML = ''; 
    users.forEach(user => {
        const li = document.createElement('li');
        li.style.padding = "8px 0";
        li.style.borderBottom = "1px solid #eee";
        li.style.listStyle = "none";
        li.textContent = `ID: ${user.id} — บันทึกเมื่อ: ${user.time}`;
        userList.appendChild(li);
    });
}

// 3. ส่งข้อมูล
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    const id = studentInput.value;
    const time = new Date().toLocaleString('th-TH');

    if (id.trim() === "") { 
        alert("❌ กรุณากรอกรหัสประจำตัว");
        return; 
    }

    // *** วาง URL ล่าสุดที่คุณก๊อปปี้มาจาก Apps Script ที่นี่ ***
    const scriptURL = 'https://script.google.com/macros/s/AKfycby2Rw64Tv5Ed77QWmyXLpdRWhKXMy2l4UfmNrX6vHy7x-Y3prpcTEvwfgpUz2SZC3ZA/exec';

    const btn = document.querySelector('.btn-signin');
    btn.innerText = 'กำลังส่งข้อมูล...';
    btn.disabled = true;

    // แก้ไข: ใช้โครงสร้างข้อมูลให้ตรงกับที่ Apps Script รอรับ
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // เพื่อข้ามข้อจำกัดความปลอดภัยของ Browser
        cache: 'no-cache',
        body: JSON.stringify({ "id": id, "time": time })
    })
    .then(() => {
        // บันทึกสำรองในเครื่อง
        let users = JSON.parse(localStorage.getItem('tvm_data')) || [];
        users.unshift({ id, time });
        if (users.length > 30) users.pop();
        localStorage.setItem('tvm_data', JSON.stringify(users));

        alert("✅ ส่งข้อมูลแล้ว! กรุณาเช็คใน Google Sheets");
        displayUsers();
        loginForm.reset();
    })
    .catch(error => {
        alert("❌ เชื่อมต่อไม่สำเร็จ");
    })
    .finally(() => {
        btn.innerText = '➜ SIGN IN';
        btn.disabled = false;
    });
});

displayUsers();