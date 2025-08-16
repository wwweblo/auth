let page = 1;
let limit = 10;
let sort = "username";
let order = "ASC";

// проверка авторизации при загрузке страницы
async function checkAuth() {
	const res = await fetch(`/api/users?page=1&limit=1`, {
		credentials: "include",
	});
	if (res.status === 401) {
		window.location.href = "login.html";
	} else {
		fetchUsers();
	}
}
checkAuth();

async function fetchUsers() {
	const res = await fetch(
		`/api/users?page=${page}&limit=${limit}&sort=${sort}&order=${order}`,
		{
			credentials: "include",
		},
	);
	if (res.status === 401) {
		logout();
		return;
	}
	const users = await res.json();
	const tbody = document.querySelector("#usersTable tbody");
	tbody.innerHTML = "";
	users.forEach((u) => {
		tbody.innerHTML += `
        <tr>
            <td>${u.username}</td>
            <td>${u.first_name}</td>
            <td>${u.birthdate}</td>
            <td class="actions">
                <button onclick="editUser(${u.id})">Редактировать</button>
                <button onclick="deleteUser(${u.id})">Удалить</button>
            </td>
        </tr>`;
	});
	document.getElementById("pageInfo").innerText = `Страница ${page}`;
}

function sortTable(column) {
	if (sort === column) order = order === "ASC" ? "DESC" : "ASC";
	else {
		sort = column;
		order = "ASC";
	}
	fetchUsers();
}

function nextPage() {
	page++;
	fetchUsers();
}
function prevPage() {
	if (page > 1) page--;
	fetchUsers();
}

function editUser(id) {
	window.location.href = `user_form.html?id=${id}`;
}

async function deleteUser(id) {
	if (!confirm("Удалить пользователя?")) return;
	await fetch(`/api/users/${id}`, {
		method: "DELETE",
		credentials: "include",
	});
	fetchUsers();
}

function logout() {
	fetch("/api/auth/logout", { method: "POST", credentials: "include" });
	window.location.href = "login.html";
}
