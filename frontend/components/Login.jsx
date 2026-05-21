import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './App.css'; // Убедись, что CSS подключен

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // ВАЖНО: Убедись, что адрес правильный (обычно /auth/login или /api/auth/login)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // 1. Получаем данные пользователя от сервера (там будет id, fullName, role и т.д.)
                const data = await response.json();

                console.log("Успешный вход! Данные сервера:", data); // Для проверки в консоли

                // 2. !!! САМОЕ ВАЖНОЕ: СОХРАНЯЕМ ИХ В БРАУЗЕРЕ !!!
                localStorage.setItem('user', JSON.stringify(data));

                toast.success(`Добро пожаловать, ${data.fullName || data.username}!`, { duration: 2500 });

                // 3. Перенаправляем в зависимости от роли
                if (data.role === 'PSYCHOLOGIST') {
                    navigate('/psychologist');
                } else {
                    navigate('/client-home');
                }
            } else {
                toast.error("Неверный логин или пароль");
            }
        } catch (error) {
            console.error("Ошибка входа:", error);
            toast.error("Ошибка соединения с сервером");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Вход в систему</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Логин (username)"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" className="btn-primary">Войти</button>
                </form>

                <div className="auth-links">
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
