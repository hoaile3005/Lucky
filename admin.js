function displayUsers() {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const prizes = user.prizes ? user.prizes.map(p => p.prize).join(', ') : 'Chưa có';
        
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.gender === 'male' ? 'Nam' : 'Nữ'}</td>
            <td>${user.phone}</td>
            <td>${new Date(user.timestamp).toLocaleString()}</td>
            <td>${prizes}</td>
        `;
        
        userTableBody.appendChild(row);
    });
} 