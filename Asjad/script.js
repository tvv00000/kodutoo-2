console.log("scripti fail õigesti ühendatud")

let playerName = prompt("Palun sisesta oma nimi");

class Typer{
    constructor(pname){
        this.name = pname;
        this.wordsInGame = 1;
        this.startingWordLength = 3;
        this.words = [];
        this.word = "START";
        this.typeWords = [];
        this.startTime = 0;
        this.endTime = 0;
        this.typedCount = 0;
        this.allResults = JSON.parse(localStorage.getItem('typer')) || [];
        this.score = 0;

        this.loadFromFile();
        this.showAllResults();
    }

    
    loadFromFile(){
        $.get("lemmad2013.txt", (data) => this.getWords(data))
        $.get("database.txt", (data) => {
            let content = JSON.parse(data).content;
            this.allResults = content;
            console.log(content);
        })
    }

    getWords(data){
        const dataFromFile = data.split("\n");
        this.separateWordsByLength(dataFromFile);
    }

    separateWordsByLength(data){
        for(let i = 0; i < data.length; i++){
            const wordLength = data[i].length;

            if(this.words[wordLength] === undefined){
                this.words[wordLength] = [];
            }

            this.words[wordLength].push(data[i]);
        }

        console.log(this.words);

        this.startTyper();
    }

    startTyper(){
        this.generateWords();
        this.startTime = performance.now();
        $(document).keypress((event) => {this.shortenWords(event.key)});
    }

    generateWords(){
        for(let i = 0; i <this.wordsInGame; i++){
            const wordLength = this.startingWordLength + i;
            const randomWord = Math.round(Math.random() * this.words[wordLength].length);
            this.typeWords[i] = this.words[wordLength][randomWord];
        }
        this.selectWord();
        
    }

    drawWord(){
        $("#wordDiv").html(this.word);
    }

    selectWord(){
        this.word = this.typeWords[this.typedCount];
        this.typedCount++;
        this.drawWord();
        this.updateInfo();
    }

    updateInfo(){
        $('#info').html(this.typedCount + "/" + this.wordsInGame);
    }

    shortenWords(keyCode){
        console.log(keyCode);
        if(keyCode != this.word.charAt(0)){
            setTimeout(function(){
                $('#container').css(
                    "background-color", "lightblue"
                )
            }, 100)
            $('#container').css(
                "background-color", "red"
            )
        } else if(this.word.length == 1 && keyCode == this.word.charAt(0) && this.typedCount == this.wordsInGame){
            this.endGame();
        } else if(this.word.length == 1 && keyCode == this.word.charAt(0)){
            this.selectWord();
        } else if (this.word.length > 0 && keyCode == this.word.charAt(0)){
            this.word = this.word.slice(1);
        }

        this.drawWord();
    }

    endGame(){
        console.log("Mäng läbi");
        this.endTime = performance.now();
        $("#wordDiv").hide();
        //$(document).off(keypress);
        this.calculateAndShowScore();
    }

    calculateAndShowScore() {
        this.score = ((this.endTime - this.startTime) / 1000).toFixed(2); // Time in seconds
        let wpm = (this.wordsInGame / this.score * 60).toFixed(2); // Words per minute
        
        let feedbackText = "";
        let bgImage = "";
        
        if (wpm < 20) {
            feedbackText = "Sa alles alustad! Jätka harjutamist, et oma kiirusest rohkem teada saada.";
            bgImage = "./img/snail.png";
        } else if (wpm >= 20 && wpm <= 40) {
            feedbackText = "Tubli! Sa hakkad aru saama. Jätka, et saavutada veelgi suuremat kiirust.";
            bgImage = "./img/turtle.png";
        } else if (wpm >= 40 && wpm <= 60) {
            feedbackText = "Hea töö! Oled keskmisel kiirusel. Püüa edasi, et veelgi kiiremini kirjutada!";
            bgImage = "./img/average.png";
        } else if (wpm >= 60 && wpm <= 80) {
            feedbackText = "Suurepärane! Sa kirjutad kiiresti. Jätka samas vaimus ja püüa veelgi täiuslikumat kiirust.";
            bgImage = "./img/rabbit.png";
        } else if (wpm > 80) {
            feedbackText = "Imeline! Sa kirjutad välkkiirusel. Oled kirjutamise meister!";
            bgImage = "./img/cheetah.png";
        }
        
    
        $("#score").html(`
            Time: ${this.score} seconds<br>
            WPM: ${wpm}<br>
            ${feedbackText}
        `).show();
        
        $('#container').css({
            "background-image": `url('${bgImage}')`,
            "background-size": "cover",
            "background-position": "center"
        });
    
        this.saveResult();
    }
    
    
    

    saveResult(){
        let result = {
            name: this.name,
            score: this.score
        }
        this.allResults.push(result);
        this.allResults.sort((a, b) => parseFloat(a.score) - parseFloat(b.score));
        console.log(this.allResults);
        localStorage.setItem('typer', JSON.stringify(this.allResults));
        this.saveToFile();
        this.showAllResults();
    }

    showAllResults() {
        $('#results').html("");
        for (let i = 0; i < this.allResults.length; i++) {
            let result = this.allResults[i];
            let timeInSeconds = parseFloat(result.score);
            let wpm = timeInSeconds > 0 ? ((this.wordsInGame / timeInSeconds) * 60).toFixed(2) : "0";
    
            $('#results').append(`
                <tr>
                    <td>${i + 1}</td>
                    <td>${result.name}</td>
                    <td>${result.score} s</td>
                    <td>${wpm} WPM</td>
                </tr>
            `);
        }
    }
    
    
    

    saveToFile(){
        $.post('server.php', {save: this.allResults}).fail(
            function(){
                console.log("Fail");
            }
        )
    }
}

$(document).ready(function () {
    const modal = $('#resultsModal');
    const btn = $('#openResultsBtn');
    const span = $('.close');

    btn.on('click', function () {
        modal.show();
    });

    span.on('click', function () {
        modal.hide();
    });

    $(window).on('click', function (event) {
        if ($(event.target).is(modal)) {
            modal.hide();
        }
    });
});


let typer = new Typer(playerName);