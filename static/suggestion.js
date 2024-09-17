const cooldownDuration = 10 * 360000;
const prohibitedWords = ['fuck', 'shit', 'asshole', 'bitch', 'bastard', 'damn', 'crap', 'dick', 'piss', 'cunt', 'motherfucker', 'douche',
'prick', 'whore', 'slut', 'fag', 'nigger', 'spic', 'retard', 'twat', 'bollocks', 'wanker', 'bugger', 'arse',
'shithead', 'dumbass', 'jackass', 'dipshit', 'dildo', 'knobhead', 'ballsack', 'buttfucker', 'cum', 'jizz',
'cocksucker', 'fucker', 'skank', 'pussy', 'tits', 'clit', 'schlong', 'dickhead', 'goddamn', 'hell', 'bitchass',
'fuckface', 'shitfaced', 'asshat', 'bint', 'chink', 'gook', 'jap', 'negro', 'dyke', 'queer', 'tranny', 'tosser',
'spaz', 'mong', 'coon', 'beaner', 'cracker', 'wetback', 'homo', 'fudgepacker', 'tard', 'cocks', 'bollocks',
'numbnuts', 'knob', 'muppet', 'git', 'shag', 'minge', 'git', 'bugger', 'tosser', 'nonce', 'plonker', 'pillock']
; // Example word filtering

// Function to get the last submission time from localStorage
function getLastSubmissionTime() {
    const storedTime = localStorage.getItem('lastSubmissionTime');
    return storedTime ? parseInt(storedTime, 10) : 0;
}

// Function to save the last submission time to localStorage
function setLastSubmissionTime(time) {
    localStorage.setItem('lastSubmissionTime', time.toString());
}

function sendMessage() {
    // Get the current time
    const currentTime = Date.now();

    // Retrieve the last submission time from localStorage
    const lastSubmissionTime = getLastSubmissionTime();

    // Cooldown logic to prevent spamming
    if (currentTime - lastSubmissionTime < cooldownDuration) {
        alert(`Please wait for ${cooldownDuration / 1000} seconds between submissions.`);
        return;
    }

    // Get the values from the input fields
    const pseudoname = document.getElementById("name").value || "Anonymous";
    const rating = parseInt(document.getElementById("rate").value, 10);
    const comment = document.getElementById("text").value.trim();

    // Validation: Rating should be between 1 and 10
    if (isNaN(rating) || rating < 1 || rating > 10) {
        alert("Rating must be a number between 1 and 10.");
        return;
    }

    // Validation: Comment length (min 5, max 500) and simple prohibited word check
    if (comment.length < 5 || comment.length > 500) {
        alert("Comment must be between 5 and 500 characters.");
        return;
    }

    // Check for prohibited words (basic check)
    for (const word of prohibitedWords) {
        if (comment.toLowerCase().includes(word)) {
            alert("Your comment contains inappropriate content.");
            return;
        }
    }

    // If all checks pass, send the message to the Discord webhook
    const request = new XMLHttpRequest();
    request.open("POST", "https://discord.com/api/webhooks/1284936894890901649/Zi-2ZV12L1v1OSBoM-DluE1V1LECXilrNNRZYJcxelnwO7rGgXNH47dxvfFEOK7Fe9_J");
    request.setRequestHeader('Content-type', 'application/json');

    // Create the content to send to the Discord webhook
    const content = `**Rating:** ${rating}\n**Comment:**\n${comment}`;

    // Debugging information
    console.log('Sending message with content:', content);

    // Send the message payload to the Discord webhook
    const params = {
        username: pseudoname,  // Pseudoname will appear as the username
        content: content       // The combined content (pseudoname, rating, and comment)
    };

    request.send(JSON.stringify(params));

    // Update the last submission time to the current time
    setLastSubmissionTime(currentTime);

    // Optionally, you can reset the form after sending
    document.getElementById("name").value = "";
    document.getElementById("rate").value = "";
    document.getElementById("text").value = "";

    // Display the success message
    const successMessage = document.getElementById("successMessage");
    successMessage.textContent = "Successfully sent the message!";
    successMessage.style.display = "block";  // Ensure the message is visible

    // Optionally hide the message after a few seconds
    setTimeout(() => {
        successMessage.style.display = "none"; // Hide message after 3 seconds
    }, 3000);
}
