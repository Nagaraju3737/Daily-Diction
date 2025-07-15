const historyList = document.getElementById("historyList");
const streakElement = document.getElementById("streak");

let history = JSON.parse(localStorage.getItem("wordHistory")) || [];
let streak = parseInt(localStorage.getItem("streak") || 1);
streakElement.textContent = streak;

const todayWord = "Eloquent";

const today = new Date().toISOString().split("T")[0];
const lastSeen = localStorage.getItem("lastSeen");

if (lastSeen !== today) 
  {
  if (lastSeen === getYesterday()) {
    streak += 1;
  } 
  else 
  {
    streak = 1;
  }
  localStorage.setItem("lastSeen", today);
  localStorage.setItem("streak", streak);
  localStorage.setItem("wordHistory", JSON.stringify([todayWord, ...history.slice(0, 4)]));
}

streakElement.textContent = streak;

document.getElementById("emailForm").addEventListener("submit", async function (e) 
{
  e.preventDefault();
  const email = document.getElementById("email").value;
  
  try {
    const response = await fetch('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(`🎉 ${data.message}`);
      document.getElementById("email").value = "";
    } else {
      alert(`❌ ${data.error}`);
    }
  } catch (error) {
    console.error('Subscription error:', error);
    alert('❌ Failed to subscribe. Please try again.');
  }
});

//API fetching...

fetch('http://localhost:3000/api/word-of-the-day')
  .then(response => response.json())
  .then(data => {
    document.getElementById('word').textContent = data.word;
    document.getElementById('synonyms').textContent = data.synonyms.join(', ');
    document.getElementById('antonyms').textContent = data.antonyms.join(', ');
    const exampleText = data.example || (data.examples && data.examples[0]) || 'No example available';
    document.getElementById('example').textContent = exampleText;
  })
  .catch(error => {
    console.error('Error fetching word of the day:', error);
    document.getElementById('example').textContent = 'Example not available';
  });
