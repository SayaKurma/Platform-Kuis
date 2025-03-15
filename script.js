let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizTitle = "";
let quizMode = "classic";
let timeLimit = 0;
let timer;
let timerInterval;
let selectedAnswer = null;

document.getElementById('media').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : 'Tidak ada file dipilih';
    document.getElementById('file-name').textContent = fileName;
});

function changeQuestionType() {
    const questionType = document.getElementById('question-type').value;
    const answerInputs = document.getElementById('answer-inputs');
    answerInputs.innerHTML = '';
    
    if (questionType === 'truefalse') {
        const trueOption = createCorrectAnswerInput('Benar');
        const falseOption = createAnswerInput('Salah');
        answerInputs.appendChild(trueOption);
        answerInputs.appendChild(falseOption);
    } 
    else if (questionType === 'multiple') {
        const correctOption = createCorrectAnswerInput('');
        answerInputs.appendChild(correctOption);
        
        for (let i = 0; i < 3; i++) {
            answerInputs.appendChild(createAnswerInput(''));
        }
        
        const addButton = document.createElement('button');
        addButton.className = 'btn secondary';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Tambah Opsi';
        addButton.onclick = function() {
            answerInputs.insertBefore(createAnswerInput(''), this);
        };
        answerInputs.appendChild(addButton);
    } 
    else if (questionType === 'text') {
        const correctOption = createCorrectAnswerInput('');
        answerInputs.appendChild(correctOption);
    } 
    else if (questionType === 'match') {
        for (let i = 0; i < 3; i++) {
            const matchContainer = document.createElement('div');
            matchContainer.className = 'match-item';
            
            const leftInput = document.createElement('input');
            leftInput.type = 'text';
            leftInput.placeholder = 'Item ' + (i + 1);
            
            const rightInput = document.createElement('input');
            rightInput.type = 'text';
            rightInput.placeholder = 'Pasangan ' + (i + 1);
            
            matchContainer.appendChild(leftInput);
            matchContainer.appendChild(rightInput);
            answerInputs.appendChild(matchContainer);
        }
        
        const addButton = document.createElement('button');
        addButton.className = 'btn secondary';
        addButton.innerHTML = '<i class="fas fa-plus"></i> Tambah Pasangan';
        addButton.onclick = function() {
            const matchContainer = document.createElement('div');
            matchContainer.className = 'match-item';
            
            const leftInput = document.createElement('input');
            leftInput.type = 'text';
            leftInput.placeholder = 'Item ' + (answerInputs.querySelectorAll('.match-item').length + 1);
            
            const rightInput = document.createElement('input');
            rightInput.type = 'text';
            rightInput.placeholder = 'Pasangan ' + (answerInputs.querySelectorAll('.match-item').length + 1);
            
            matchContainer.appendChild(leftInput);
            matchContainer.appendChild(rightInput);
            answerInputs.insertBefore(matchContainer, this);
        };
        answerInputs.appendChild(addButton);
    }
}

function createAnswerInput(value) {
    const div = document.createElement('div');
    div.className = 'answer-input';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Masukkan jawaban';
    
    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = function() {
        div.remove();
    };
    
    div.appendChild(input);
    div.appendChild(removeBtn);
    return div;
}

function createCorrectAnswerInput(value) {
    const div = document.createElement('div');
    div.className = 'answer-input correct-answer';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Jawaban benar';
    
    const label = document.createElement('span');
    label.innerHTML = '<i class="fas fa-check"></i> Benar';
    label.style.padding = '12px';
    label.style.color = 'var(--success-color)';
    
    div.appendChild(input);
    div.appendChild(label);
    return div;
}

function setTitle() {
    const titleInput = document.getElementById('quiz-title').value.trim();
    if (titleInput) {
        quizTitle = titleInput;
        document.getElementById('display-title').textContent = quizTitle;
        document.getElementById('title-section').style.display = 'none';
        document.getElementById('input-section').style.display = 'block';
        changeQuestionType();
    } else {
        alert('Mohon masukkan judul kuis!');
    }
}

function showQuizOptions() {
    document.getElementById('input-section').style.display = 'none';
    document.getElementById('quiz-options').style.display = 'block';
}

function setMode(mode) {
    quizMode = mode;
    if (mode === 'timed') {
        document.getElementById('quiz-options').style.display = 'none';
        document.getElementById('time-options').style.display = 'block';
    } else {
        document.getElementById('quiz-options').style.display = 'none';
        startQuiz();
    }
}

function confirmTime() {
    timeLimit = parseInt(document.getElementById('time-limit').value);
    document.getElementById('time-options').style.display = 'none';
    startQuiz();
}

function addQuestion() {
    const question = document.getElementById('question').value.trim();
    const questionType = document.getElementById('question-type').value;
    const mediaInput = document.getElementById('media').files[0];
    
    if (!question) {
        alert('Mohon isi pertanyaan!');
        return;
    }
    
    let answers = [];
    let correctAnswer = '';
    
    if (questionType === 'truefalse') {
        answers = ['Benar', 'Salah'];
        correctAnswer = document.querySelector('.correct-answer input').value.trim() || 'Benar';
    } 
    else if (questionType === 'multiple') {
        const answerInputs = document.querySelectorAll('#answer-inputs input');
        correctAnswer = document.querySelector('.correct-answer input').value.trim();
        
        if (!correctAnswer) {
            alert('Mohon isi jawaban yang benar!');
            return;
        }
        
        answers.push(correctAnswer);
        
        for (let i = 1; i < answerInputs.length; i++) {
            const answerValue = answerInputs[i].value.trim();
            if (answerValue) {
                answers.push(answerValue);
            }
        }
        
        if (answers.length < 2) {
            alert('Mohon masukkan minimal satu opsi tambahan!');
            return;
        }
    } 
    else if (questionType === 'text') {
        correctAnswer = document.querySelector('.correct-answer input').value.trim();
        
        if (!correctAnswer) {
            alert('Mohon isi jawaban yang benar!');
            return;
        }
        
        answers = [correctAnswer];
    } 
    else if (questionType === 'match') {
        const matchItems = document.querySelectorAll('.match-item');
        const matchPairs = [];
        
        for (let i = 0; i < matchItems.length; i++) {
            const inputs = matchItems[i].querySelectorAll('input');
            const leftValue = inputs[0].value.trim();
            const rightValue = inputs[1].value.trim();
            
            if (leftValue && rightValue) {
                matchPairs.push({
                    item: leftValue,
                    match: rightValue
                });
            }
        }
        
        if (matchPairs.length < 2) {
            alert('Mohon masukkan minimal dua pasangan jawaban!');
            return;
        }
        
        answers = matchPairs;
        correctAnswer = 'match';
    }
    
    let mediaURL = "";
    if (mediaInput) {
        mediaURL = URL.createObjectURL(mediaInput);
    }
    
    questions.push({
        question: question,
        type: questionType,
        answers: answers,
        correctAnswer: correctAnswer,
        media: mediaURL
    });
    
    const questionList = document.getElementById('question-list');
    const listItem = document.createElement('li');
    listItem.innerHTML = `<i class="fas fa-question-circle"></i> ${question}`;
    questionList.appendChild(listItem);
    
    document.getElementById('question').value = '';
    document.getElementById('answer-inputs').innerHTML = '';
    document.getElementById('media').value = '';
    document.getElementById('file-name').textContent = 'Tidak ada file dipilih';
    document.getElementById('start-quiz').disabled = false;
    
    changeQuestionType();
}

function startQuiz() {
    document.getElementById('questions-list-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    
    document.getElementById('quiz-title-display').textContent = quizTitle;
    currentQuestionIndex = 0;
    score = 0;
    
    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        document.getElementById('quiz-question').textContent = currentQuestion.question;
        document.getElementById('question-counter').textContent = `Pertanyaan ${currentQuestionIndex + 1} dari ${questions.length}`;
        
        document.getElementById('quiz-media').innerHTML = '';
        if (currentQuestion.media) {
            if (currentQuestion.media.includes('image')) {
                const img = document.createElement('img');
                img.src = currentQuestion.media;
                document.getElementById('quiz-media').appendChild(img);
            } else if (currentQuestion.media.includes('video')) {
                const video = document.createElement('video');
                video.src = currentQuestion.media;
                video.controls = true;
                document.getElementById('quiz-media').appendChild(video);
            } else if (currentQuestion.media.includes('audio')) {
                const audio = document.createElement('audio');
                audio.src = currentQuestion.media;
                audio.controls = true;
                document.getElementById('quiz-media').appendChild(audio);
            }
        }
        
        const answersContainer = document.getElementById('quiz-answers');
        answersContainer.innerHTML = '';
        selectedAnswer = null;
        
        if (currentQuestion.type === 'truefalse' || currentQuestion.type === 'multiple') {
            const shuffledAnswers = [...currentQuestion.answers].sort(() => Math.random() - 0.5);
            
            shuffledAnswers.forEach(answer => {
                const button = document.createElement('button');
                button.className = 'answer-option';
                button.textContent = answer;
                button.onclick = () => {
                    document.querySelectorAll('.answer-option').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    button.classList.add('selected');
                    selectedAnswer = answer;
                };
                answersContainer.appendChild(button);
            });
        } 
        else if (currentQuestion.type === 'text') {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Ketik jawaban Anda';
            input.onchange = (e) => {
                selectedAnswer = e.target.value.trim();
            };
            answersContainer.appendChild(input);
        } 
        else if (currentQuestion.type === 'match') {
            const matchItems = currentQuestion.answers;
            const shuffledMatches = [...matchItems].sort(() => Math.random() - 0.5);
            
            const matchContainer = document.createElement('div');
            matchContainer.className = 'match-container';
            
            const leftColumn = document.createElement('div');
            leftColumn.className = 'match-column';
            
            const rightColumn = document.createElement('div');
            rightColumn.className = 'match-column';
            
            shuffledMatches.forEach((pair, index) => {
                const leftItem = document.createElement('div');
                leftItem.className = 'match-option';
                leftItem.textContent = pair.item;
                leftItem.dataset.index = index;
                
                const rightItem = document.createElement('div');
                rightItem.className = 'match-option';
                rightItem.textContent = pair.match;
                rightItem.dataset.index = index;
                rightItem.dataset.match = pair.item;
                
                leftColumn.appendChild(leftItem);
                rightColumn.appendChild(rightItem);
            });
            
            matchContainer.appendChild(leftColumn);
            matchContainer.appendChild(rightColumn);
            answersContainer.appendChild(matchContainer);
        }
        
        if (quizMode === 'timed') {
            startTimer();
        }
    } else {
        endQuiz();
    }
}

function startTimer() {
    let timeLeft = timeLimit;
    document.getElementById('timer').textContent = `Waktu: ${timeLeft} detik`;
    
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.setProperty('--countdown-time', `${timeLimit}s`);
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerBar.style.animation = 'none';
    void timerBar.offsetWidth;
    timerBar.style.animation = `countdown ${timeLimit}s linear forwards`;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Waktu: ${timeLeft} detik`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            checkAnswer();
        }
    }, 1000);
}

function checkAnswer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const feedback = document.getElementById('feedback');
    
    if (currentQuestion.type === 'truefalse' || currentQuestion.type === 'multiple') {
        if (selectedAnswer === null) {
            feedback.textContent = 'Pilih jawaban terlebih dahulu!';
            feedback.className = 'feedback incorrect';
            return;
        }
        
        if (selectedAnswer === currentQuestion.correctAnswer) {
            score++;
            feedback.textContent = 'Benar!';
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = `Salah. Jawaban yang benar adalah: ${currentQuestion.correctAnswer}`;
            feedback.className = 'feedback incorrect';
        }
    } 
    else if (currentQuestion.type === 'text') {
        if (!selectedAnswer) {
            feedback.textContent = 'Masukkan jawaban terlebih dahulu!';
            feedback.className = 'feedback incorrect';
            return;
        }
        
        if (selectedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
            score++;
            feedback.textContent = 'Benar!';
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = `Salah. Jawaban yang benar adalah: ${currentQuestion.correctAnswer}`;
            feedback.className = 'feedback incorrect';
        }
    } 
    else if (currentQuestion.type === 'match') {
        // Implementasi pengecekan untuk match akan lebih kompleks
        // Untuk saat ini, kita akan menganggap jawaban benar
        score++;
        feedback.textContent = 'Benar!';
        feedback.className = 'feedback correct';
    }
    
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 1500);
}

function endQuiz() {
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
    
    const finalScore = (score / questions.length) * 100;
    document.getElementById('score-percentage').textContent = `${Math.round(finalScore)}%`;
    document.getElementById('result-title').textContent = quizTitle;
    document.getElementById('result').textContent = `Anda menjawab ${score} dari ${questions.length} pertanyaan dengan benar.`;
    
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.setProperty('--score-percent', `${finalScore}%`);
    
    let history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    history.push({
        title: quizTitle,
        score: finalScore,
        questions: questions,
        date: new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    });
    localStorage.setItem('quizHistory', JSON.stringify(history));
    
    loadHistory();
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = "";
    
    const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = "<p>Belum ada riwayat kuis.</p>";
        return;
    }
    
    history.forEach((quiz, index) => {
        const item = document.createElement('li');
        item.innerHTML = `
            <div class="history-item">
                <h3>${quiz.title}</h3>
                <p>${quiz.date || 'Tanggal tidak tersedia'}</p>
            </div>
            <div class="history-score">${Math.round(quiz.score)}%</div>
            <div class="history-buttons">
                <button class="btn primary" onclick="replayQuiz(${index})">
                    <i class="fas fa-play"></i> Main
                </button>
                <button class="btn danger" onclick="deleteHistory(${index})">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        `;
        historyList.appendChild(item);
    });
}

function replayQuiz(index) {
    const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    questions = history[index].questions;
    quizTitle = history[index].title;
    quizMode = "classic";
    
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('history-section').style.display = 'none';
    
    startQuiz();
}

function deleteHistory(index) {
    const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    history.splice(index, 1);
    localStorage.setItem('quizHistory', JSON.stringify(history));
    loadHistory();
}

function resetQuiz() {
    questions = [];
    quizTitle = "";
    quizMode = "classic";
    timeLimit = 0;
    
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('quiz-title').value = '';
    document.getElementById('question-list').innerHTML = '';
    document.getElementById('title-section').style.display = 'block';
    document.getElementById('start-quiz').disabled = true;
}

function showHistory() {
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('history-section').style.display = 'block';
}

window.onload = function() {
    loadHistory();
    changeQuestionType();
};
