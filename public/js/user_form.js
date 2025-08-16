const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

async function checkAuth() {
	const res = await fetch("/api/users?page=1&limit=1", {
		credentials: "include",
	});
	if (res.status === 401) window.location.href = "login.html";
}
checkAuth();

async function loadUser() {
	const res = await fetch(`/api/users/${userId}`, {
		credentials: "include",
	});
	if (res.status === 401) {
		logout();
		return;
	}
	const user = await res.json();
	document.getElementById("username").value = user.username;
	document.getElementById("first_name").value = user.first_name;
	document.getElementById("last_name").value = user.last_name;
	document.getElementById("gender").value = user.gender;
	document.getElementById("birthdate").value = user.birthdate;
	document.getElementById("password").required = false;
}

document.getElementById("userForm").addEventListener("submit", async (e) => {
	e.preventDefault();
	const data = {
		username: document.getElementById("username").value,
		password: document.getElementById("password").value,
		first_name: document.getElementById("first_name").value,
		last_name: document.getElementById("last_name").value,
		gender: document.getElementById("gender").value,
		birthdate: document.getElementById("birthdate").value,
	};
	let res;
	if (userId) {
		res = await fetch(`/api/users/${userId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
	} else {
		res = await fetch("/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(data),
		});
	}
	if (res.ok) window.location.href = "index.html";
	else alert("Ошибка сохранения");
});

function logout() {
	fetch("/api/auth/logout", { method: "POST", credentials: "include" });
	window.location.href = "login.html";
}
