/* style.css v1.0 - Optimiert für bessere Zentrierung */
body {
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    color: #222;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1 {
    text-align: center;
    margin-top: 30px;
    color: #4a90e2;
}

form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: 500px;
    background-color: white;
    padding: 25px 30px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    box-sizing: border-box;
}

label {
    margin-top: 15px;
    font-weight: bold;
}

input[type="text"] {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    border-radius: 6px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    font-size: 16px;
}

button {
    margin-top: 20px;
    padding: 12px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #357ab8;
}

#results {
    width: 100%;
    max-width: 500px;
    margin: 25px auto;
    padding: 20px;
    background-color: #e1f0ff;
    border-radius: 8px;
    border: 1px solid #b3d4fc;
    box-sizing: border-box;
}