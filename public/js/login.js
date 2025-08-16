document.getElementById("loginForm").addEventListener("submit", async (e) => {
	e.preventDefault();
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	const res = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password }),
		credentials: "include",
	});

	const data = await res.json();
	if (res.ok) {
		window.location.href = "index.html";
	} else {
		document.getElementById("error").innerText = data.message;
	}
});
