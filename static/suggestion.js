const cooldownDuration = 10 * 360000;
const prohibitedWords = ['fuck', 'shit', 'asshole', 'bitch', 'bastard', 'damn', 'crap', 'dick', 'piss', 'cunt', 'motherfucker', 'douche',
'prick', 'whore', 'slut', 'fag', 'nigger', 'spic', 'retard', 'twat', 'bollocks', 'wanker', 'bugger', 'arse',
'shithead', 'dumbass', 'jackass', 'dipshit', 'dildo', 'knobhead', 'ballsack', 'buttfucker', 'cum', 'jizz',
'cocksucker', 'fucker', 'skank', 'pussy', 'tits', 'clit', 'schlong', 'dickhead', 'goddamn', 'hell', 'bitchass',
'fuckface', 'shitfaced', 'asshat', 'bint', 'chink', 'gook', 'jap', 'negro', 'dyke', 'queer', 'tranny', 'tosser',
'spaz', 'mong', 'coon', 'beaner', 'cracker', 'wetback', 'homo', 'fudgepacker', 'tard', 'cocks', 'bollocks',
'numbnuts', 'knob', 'muppet', 'git', 'shag', 'minge', 'git', 'bugger', 'tosser', 'nonce', 'plonker', 'pillock']
;

function getLastSubmissionTime() {
    const storedTime = localStorage.getItem('lastSubmissionTime');
    return storedTime ? parseInt(storedTime, 10) : 0;
}

function setLastSubmissionTime(time) {
    localStorage.setItem('lastSubmissionTime', time.toString());
}

function sendMessage() {
    const currentTime = Date.now();
    const lastSubmissionTime = getLastSubmissionTime();
    if (currentTime - lastSubmissionTime < cooldownDuration) {
        alert(`Please wait for ${cooldownDuration / 1000} seconds between submissions.`);
        return;
    }
    const pseudoname = document.getElementById("name").value || "Anonymous";
    const rating = parseInt(document.getElementById("rate").value, 10);
    const comment = document.getElementById("text").value.trim();
    if (isNaN(rating) || rating < 1 || rating > 10) {
        alert("Rating must be a number between 1 and 10.");
        return;
    }
    if (comment.length < 5 || comment.length > 500) {
        alert("Comment must be between 5 and 500 characters.");
        return;
    }
    for (const word of prohibitedWords) {
        if (comment.toLowerCase().includes(word)) {
            alert("Your comment contains inappropriate content.");
            return;
        }
    }
    const request = new XMLHttpRequest();
    request.open("POST", "https://discord.com/api/webhooks/1284936894890901649/Zi-2ZV12L1v1OSBoM-DluE1V1LECXilrNNRZYJcxelnwO7rGgXNH47dxvfFEOK7Fe9_J");
    request.setRequestHeader('Content-type', 'application/json');
    const content = `**Rating:** ${rating}\n**Comment:**\n${comment}`;
    console.log('Sending message with content:', content);
    const params = {
        username: pseudoname,
        content: content
    };
    request.send(JSON.stringify(params));
    setLastSubmissionTime(currentTime);
    document.getElementById("name").value = "";
    document.getElementById("rate").value = "";
    document.getElementById("text").value = "";
    const successMessage = document.getElementById("successMessage");
    successMessage.textContent = "Successfully sent the message!";
    successMessage.style.display = "block";
    setTimeout(() => {
        successMessage.style.display = "none";
    }, 3000);
}
