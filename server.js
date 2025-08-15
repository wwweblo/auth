require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const { initDB, User } = require("./models");
const authMiddleware = require("./middleware/auth");

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// --- Auth Routes ---
// Логин
app.post("/api/auth/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ where: { username } });
	if (!user)
		return res.status(401).json({ message: "Неверный логин или пароль" });

	const valid = await bcrypt.compare(password, user.password);
	if (!valid)
		return res.status(401).json({ message: "Неверный логин или пароль" });

	const token = jwt.sign(
		{ id: user.id, username: user.username },
		process.env.JWT_SECRET,
		{ expiresIn: "1h" },
	);

	res.cookie("token", token, {
		httpOnly: true,
		secure: false, // true только на HTTPS
		sameSite: "lax", // работает на localhost
		maxAge: 60 * 60 * 1000, // 1 час
	});

	res.json({ message: "Успешно вошли" });
});

// Logout
app.post("/api/auth/logout", (req, res) => {
	res.clearCookie("token");
	res.json({ message: "Вы вышли" });
});

// --- User Routes ---
app.get("/api/users", authMiddleware, async (req, res) => {
	const { page = 1, limit = 10, sort = "username", order = "ASC" } = req.query;
	const offset = (page - 1) * limit;
	const users = await User.findAll({
		order: [[sort, order]],
		limit: +limit,
		offset: +offset,
	});
	res.json(users);
});

app.get("/api/users/:id", authMiddleware, async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: "Пользователь не найден" });
	res.json(user);
});

app.post("/api/users", authMiddleware, async (req, res) => {
	const { username, password, first_name, last_name, gender, birthdate } =
		req.body;
	const hash = await bcrypt.hash(password, 10);
	const user = await User.create({
		username,
		password: hash,
		first_name,
		last_name,
		gender,
		birthdate,
	});
	res.json(user);
});

app.put("/api/users/:id", authMiddleware, async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: "Пользователь не найден" });
	const { username, password, first_name, last_name, gender, birthdate } =
		req.body;
	if (password) user.password = await bcrypt.hash(password, 10);
	user.username = username;
	user.first_name = first_name;
	user.last_name = last_name;
	user.gender = gender;
	user.birthdate = birthdate;
	await user.save();
	res.json(user);
});

app.delete("/api/users/:id", authMiddleware, async (req, res) => {
	const user = await User.findByPk(req.params.id);
	if (!user) return res.status(404).json({ message: "Пользователь не найден" });
	await user.destroy();
	res.json({ message: "Пользователь удалён" });
});

// --- Создание администратора ---
const createAdmin = async () => {
	const admin = await User.findOne({ where: { username: "admin" } });
	if (!admin) {
		const hash = await bcrypt.hash("admin123", 10);
		await User.create({
			username: "admin",
			password: hash,
			first_name: "Admin",
			last_name: "User",
			gender: "other",
			birthdate: "2000-01-01",
		});
		console.log("Администратор создан: admin / admin123");
	}
};

// --- Инициализация ---
const PORT = process.env.PORT || 3000;
initDB()
	.then(() => createAdmin())
	.then(() =>
		app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`)),
	)
	.catch((err) => console.error("Ошибка инициализации:", err.message));
