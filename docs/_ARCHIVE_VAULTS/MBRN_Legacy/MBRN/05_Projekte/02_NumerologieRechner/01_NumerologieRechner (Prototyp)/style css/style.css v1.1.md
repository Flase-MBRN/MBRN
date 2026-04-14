/* style.css v1.1 - Mobile & Abstände optimiert */
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
    font-size: 2em;
}

form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 90%;
    max-width: 500px;
    background-color: white;
    padding: 25px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    box-sizing: border-box;
}

label {
    margin-top: 15px;
    font-weight: bold;
    font-size: 1em;
}

input[type="text"] {
    width: 100%;
    padding: 12px;
    margin-top: 5px;
    border-radius: 6px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    font-size: 1em;
}

button {
    margin-top: 20px;
    padding: 12px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #357ab8;
}

#results {
    width: 90%;
    max-width: 500px;
    margin: 25px auto;
    padding: 20px;
    background-color: #e1f0ff;
    border-radius: 8px;
    border: 1px solid #b3d4fc;
    box-sizing: border-box;
}

/* Mobile Anpassungen */
@media (max-width: 400px) {
    h1 {
        font-size: 1.6em;
        margin-top: 20px;
    }
    form {
        padding: 20px 15px;
    }
    input[type="text"], button {
        font-size: 0.95em;
        padding: 10px;
    }
    #results {
        padding: 15px;
    }
}