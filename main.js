(() => {
	const $ = document.querySelector.bind(document);

	let timeRotate = 7000; // 7 giây
	let currentRotate = 0;
	let isRotating = false;
	const wheel = $('.wheel');
	const btnWheel = $('.btn--wheel');
	const showMsg = $('.msg');
	const popup = $('.popup');
	const popupMsg = $('.popup-msg');
	const closePopupBtn = $('.close-popup');

	const listGift = [
		{ text: 'Voucher giảm 10%', percent: 10 / 100 },
		{ text: '05 túi mù', percent: 20 / 100 },
		{ text: 'Free 01 ly size M', percent: 5 / 100 },
		{ text: '01 Gấu MiGo', percent: 5 / 100 },
		{ text: 'Free 01 ly size S', percent: 10 / 100 },
		{ text: 'Chúc bạn may mắn lần sau', percent: 50 / 100 },
	];

	const size = listGift.length;
	const rotate = 360 / size;
	const skewY = 90 - rotate;

	listGift.map((item, index) => {
		const elm = document.createElement('li');
		elm.style.transform = `rotate(${rotate * index}deg) skewY(-${skewY}deg)`;
		if (index % 2 == 0) {
			elm.innerHTML = `<p style="transform: skewY(${skewY}deg) rotate(${rotate / 2}deg);" class="text text-1">
				<b>${item.text}</b>
			</p>`;
		} else {
			elm.innerHTML = `<p style="transform: skewY(${skewY}deg) rotate(${rotate / 2}deg);" class="text text-2">
				<b>${item.text}</b>
			</p>`;
		}
		wheel.appendChild(elm);
	});

	  // Tạo hiệu ứng quay chậm tự động
	  let slowRotateInterval;
	  const startSlowRotation = () => {
		  let angle = 0;
		  slowRotateInterval = setInterval(() => {
			  angle += 0.1; // Tốc độ quay chậm
			  wheel.style.transform = `rotate(${angle}deg)`;
		  }, 16); // Cập nhật mỗi ~16ms để quay mượt
	  };

	const start = () => {
		showMsg.innerHTML = '';
		clearInterval(slowRotateInterval); // Dừng quay chậm
		isRotating = true;
		const random = Math.random();
		const gift = getGift(random);
		currentRotate += 360 * 10;
		rotateWheel(currentRotate, gift.index);
		showGift(gift);
	};

	const rotateWheel = (currentRotate, index) => {
		wheel.style.transition = `transform ${timeRotate}ms cubic-bezier(0.075, 0.82, 0.165, 1)`;
		wheel.style.transform = `rotate(${currentRotate - index * rotate - rotate / 2}deg)`;
	};

	const getGift = randomNumber => {
		let currentPercent = 0;
		let list = [];
		listGift.forEach((item, index) => {
			currentPercent += item.percent;
			if (randomNumber <= currentPercent) {
				list.push({ ...item, index });
			}
		});
		return list[0];
	};

	const showGift = gift => {
		let timer = setTimeout(() => {
			isRotating = false;
			popupMsg.innerHTML = `Chúc mừng bạn đã nhận được:<br><strong>"${gift.text}"</strong>`;
			popup.style.display = 'flex';
			createFireworks();
			startSlowRotation(); // Bắt đầu quay chậm lại sau khi hiển thị phần thưởng
			clearTimeout(timer);
			updateUserPrize(gift);
		}, timeRotate);
	};

	// Khởi tạo dữ liệu từ localStorage
	let users = JSON.parse(localStorage.getItem('users') || '[]');
	let spinsLeft = parseInt(localStorage.getItem('spinsLeft') || '0');

	function showUserForm() {
		document.getElementById('userForm').style.display = 'flex';
	}

	function closeUserForm() {
		document.getElementById('userForm').style.display = 'none';
	}

	function updateSpinsDisplay() {
		const spinsDisplay = document.querySelector('.spins-left');
		spinsDisplay.textContent = `Số lượt quay còn lại: ${spinsLeft}`;
	}

	// Thêm hàm để cập nhật kết quả trúng thưởng cho user
	function updateUserPrize(prize) {
		const currentUser = users[users.length - 1]; // Lấy user mới nhất
		if (currentUser) {
			currentUser.prizes = currentUser.prizes || []; // Tạo mảng prizes nếu chưa có
			currentUser.prizes.push({
				prize: prize.text,
				timestamp: new Date().toISOString()
			});
			localStorage.setItem('users', JSON.stringify(users));
		}
	}


	// Cập nhật cấu trúc dữ liệu khi đăng ký user mới
	document.getElementById('registrationForm').addEventListener('submit', (e) => {
		e.preventDefault();
		
		const formData = {
			name: document.getElementById('name').value,
			gender: document.querySelector('input[name="gender"]:checked').value,
			phone: document.getElementById('phone').value,
			timestamp: new Date().toISOString(),
			prizes: [] // Thêm mảng prizes để lưu kết quả
		};

		// Kiểm tra số điện thoại đã tồn tại
		if (users.some(user => user.phone === formData.phone)) {
			alert('Số điện thoại này đã được đăng ký!');
			return;
		}

		// Thêm user mới và cập nhật localStorage
		users.push(formData);
		localStorage.setItem('users', JSON.stringify(users));
		
		// Tăng số lượt quay và cập nhật localStorage
		spinsLeft += 1;
		localStorage.setItem('spinsLeft', spinsLeft);
		
		updateSpinsDisplay();
		closeUserForm();
		
		// Reset form
		document.getElementById('registrationForm').reset();
		alert('Đăng ký thành công! Bạn đã nhận được 1 lượt quay.');
	});

	btnWheel.addEventListener('click', () => {
		// Kiểm tra nghiêm ngặt số lượt quay và trạng thái quay
		if (spinsLeft <= 0) {
			showUserForm();
			return;
		}
		
		// Chỉ cho phép quay khi không trong trạng thái đang quay và còn lượt quay
		if (!isRotating && spinsLeft > 0) {
			localStorage.setItem('spinsLeft', spinsLeft - 1); // Lưu số lượt quay mới ngay lập tức
			spinsLeft -= 1;
			updateSpinsDisplay();
			wheel.style.transition = 'none';
			start();
		}
	});
	closePopupBtn.addEventListener('click', () => {
		popup.style.display = 'none';
	});
	startSlowRotation(); // Bắt đầu quay chậm ngay từ khi tải trang

	// Thêm xử lý sự kiện cho nút huỷ
	document.querySelector('.cancel-btn').addEventListener('click', () => {
		closeUserForm();
	});
})();
// Hiệu ứng tuyết rơi
const createSnowflake = () => {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    
    // Thiết lập kích thước ngẫu nhiên cho hạt tuyết
    const size = Math.random() * 10 + 5; // Kích thước từ 5px đến 15px
    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    
    // Thiết lập vị trí ngẫu nhiên ở đầu màn hình
    snowflake.style.left = `${Math.random() * 100}vw`;
    
    // Thêm hạt tuyết vào container
    document.querySelector('.snow-container').appendChild(snowflake);
    
    // Thêm hoạt ảnh cho hạt tuyết
    snowflake.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`; // Thời gian rơi từ 2s đến 5s
    
    // Khi hạt tuyết rơi xong, xóa nó khỏi DOM
    snowflake.addEventListener('animationend', () => {
        snowflake.remove();
    });
};

// Tạo hạt tuyết mới mỗi giây
setInterval(createSnowflake, 300);
// Tạo hiếu ứng pháo hoa
const createFireworks = () => {
    const fireworksContainer = document.querySelector('.fireworks-container');
    
    // Xóa pháo hoa cũ
    fireworksContainer.innerHTML = '';
    
    for (let i = 0; i < 50; i++) { // Tạo nhiều pháo hoa
        const firework = document.createElement('div');
        firework.classList.add('firework');
        firework.style.left = `${Math.random() * 100}vw`;
        firework.style.top = `${Math.random() * 100}vh`;
        
        fireworksContainer.appendChild(firework);
        
        // Tạo các hạt cho mỗi pháo hoa
        for (let j = 0; j < 10; j++) { // Số lượng hạt mỗi pháo hoa
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Ngẫu nhiên hướng di chuyển
            particle.style.setProperty('--x', `${(Math.random() - 0.5) * 300}px`);
            particle.style.setProperty('--y', `${(Math.random() - 0.5) * 300}px`);
            
            firework.appendChild(particle);
        }
    }
};