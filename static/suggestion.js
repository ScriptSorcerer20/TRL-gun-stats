const cooldownDuration = 60 * 60 * 1000;
const prohibitedWords = []

function getLastSubmissionTime() {
    const storedTime = localStorage.getItem('lastSubmissionTime');
    return storedTime ? parseInt(storedTime, 10) : 0;
}

function setLastSubmissionTime(time) {
    localStorage.setItem('lastSubmissionTime', time.toString());
}

async function sendMessage() {
    const currentTime = Date.now();
    const lastSubmissionTime = getLastSubmissionTime();
    if (currentTime - lastSubmissionTime < cooldownDuration) {
        alert(`Please wait ${Math.ceil((cooldownDuration - (currentTime - lastSubmissionTime)) / 1000)} seconds between submissions.`);
        return;
    }
    const pseudoname = document.getElementById("name").value || "Anonymous";
    const rating = parseInt(document.getElementById("rate").value, 10);
    const comment = document.getElementById("text").value.trim();
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");
    successMessage.style.display = "none";
    errorMessage.style.display = "none";

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

    try {
        const res = await fetch("/trlstats/api/feedback", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name: pseudoname,
                rating: rating,
                comment: comment
            })
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json.ok) {
            const msg = (json && json.error) ? json.error : "Failed to send feedback.";
            errorMessage.textContent = msg;
            errorMessage.style.display = "block";
            return;
        }

        setLastSubmissionTime(currentTime);
        document.getElementById("name").value = "";
        document.getElementById("rate").value = "";
        document.getElementById("text").value = "";

        successMessage.textContent = "Successfully sent the message!";
        successMessage.style.display = "block";
        setTimeout(() => {
            successMessage.style.display = "none";
        }, 3000);

    } catch (err) {
        console.error(err);
        errorMessage.textContent = "Network error: could not send feedback.";
        errorMessage.style.display = "block";
    }
}